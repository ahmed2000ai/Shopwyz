import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ParseTextDto } from './dto/parse-text.dto';
import { Unit } from '@prisma/client';

interface ParsedItem {
    name: string;
    quantity?: number;
    unit?: Unit;
    notes?: string;
    categoryName?: string;
    brand?: string;
    description?: string;
    sizeValue?: number;
    sizeUnit?: string;
}

@Injectable()
export class AiService {
    constructor(private prisma: PrismaService) { }

    /**
     * Maps string/unit hints coming back from Gemini to our Unit enum.
     * Defaults to PCS if it can't map.
     */
    private normalizeUnit(unit?: string): Unit {
        if (!unit) return Unit.PCS;
        const value = unit.toUpperCase();
        if (value === 'KG' || value === 'KGS' || value === 'KILOGRAM') return Unit.KG;
        if (value === 'G' || value === 'GRAM' || value === 'GRAMS') return Unit.G;
        if (value === 'L' || value === 'LITER' || value === 'LITRE' || value === 'LITERS' || value === 'LITRES') return Unit.L;
        if (value === 'ML' || value === 'MILLILITER' || value === 'MILLILITRE' || value === 'MILLILITERS' || value === 'MILLILITRES') return Unit.ML;
        if (value === 'PACK' || value === 'PACKS' || value === 'PACKET') return Unit.PACK;
        return Unit.PCS;
    }

    /**
     * Call Gemini to parse grocery lines into structured items.
     */
    private async callGemini(lines: string[]): Promise<ParsedItem[]> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new InternalServerErrorException('GEMINI_API_KEY is not set in environment');
        }

        const prompt = `
You are a grocery list parser. Convert each input line into a structured grocery item.
Rules:
- Treat each line independently.
- Return JSON ONLY, no prose.
- Fields per item: name, brand, description, category, quantity, sizeValue, sizeUnit, notes.
- quantity must be a number; default to 1 if not specified.
- sizeUnit should be one of: KG, G, L, ML, PCS, PACK if present.
- If brand is present, keep it separate from name.
- If description is provided, keep it brief.

Input lines:
${lines.map((l) => `- ${l}`).join('\n')}

Respond with a JSON array, one object per line, preserving order.
Example output:
[
  {"name":"whole milk","brand":"Almarai","description":"full fat","category":"Dairy","quantity":3,"sizeValue":1,"sizeUnit":"L","notes":""},
  {"name":"bananas","brand":"","description":"","category":"Fruit","quantity":6,"sizeValue":null,"sizeUnit":null,"notes":""}
]
        `.trim();

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 },
            }),
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new InternalServerErrorException(`Gemini API error: ${res.status} ${txt}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new InternalServerErrorException('Gemini response missing text');
        }

        // Extract JSON from response text
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            throw new InternalServerErrorException('Gemini response missing JSON array');
        }

        const jsonStr = text.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) {
            throw new InternalServerErrorException('Gemini response is not an array');
        }

        return parsed.map((item: any, idx: number) => ({
            name: item?.name ?? lines[idx] ?? 'item',
            brand: item?.brand ?? '',
            description: item?.description ?? '',
            categoryName: item?.category ?? item?.categoryName ?? '',
            quantity: typeof item?.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            sizeValue: typeof item?.sizeValue === 'number' ? item.sizeValue : undefined,
            sizeUnit: item?.sizeUnit,
            notes: item?.notes ?? '',
            unit: item?.sizeUnit ? this.normalizeUnit(item.sizeUnit) : undefined,
        }));
    }

    async parseAndAddItems(userId: string, dto: ParseTextDto) {
        const { listId, text } = dto;

        // 1. Validate List and Membership
        const list = await this.prisma.list.findUnique({
            where: { id: listId },
        });
        if (!list) throw new NotFoundException('List not found');

        const membership = await this.prisma.householdMember.findUnique({
            where: {
                userId_householdId: {
                    userId,
                    householdId: list.householdId,
                },
            },
        });
        if (!membership) {
            throw new ForbiddenException('User is not a member of this household');
        }

        // 2. Split text by lines; each non-empty line -> item
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        if (lines.length === 0) {
            throw new BadRequestException('No items provided');
        }

        // 3. Parse via Gemini
        const parsedItems = await this.callGemini(lines);

        // 4. Create Items & Resolve Categories
        const createdItems: any[] = [];

        for (const pItem of parsedItems) {
            let categoryId: string | null = null;

            // Resolve Category by Name
            if (pItem.categoryName) {
                const category = await this.prisma.category.findFirst({
                    where: {
                        name: { equals: pItem.categoryName, mode: 'insensitive' }
                    },
                });
                if (category) {
                    categoryId = category.id;
                }
            }

            const quantity = pItem.quantity && pItem.quantity > 0 ? pItem.quantity : 1;
            const unit = pItem.unit ? pItem.unit : this.normalizeUnit(pItem.sizeUnit);

            // Combine brand + name for display if brand is provided
            const displayName = pItem.brand ? `${pItem.brand} ${pItem.name}`.trim() : pItem.name;

            const notesParts = [];
            if (pItem.description) notesParts.push(pItem.description);
            if (pItem.notes) notesParts.push(pItem.notes);
            if (pItem.sizeValue && pItem.sizeUnit) {
                notesParts.push(`Size: ${pItem.sizeValue} ${pItem.sizeUnit}`);
            }

            const newItem = await this.prisma.listItem.create({
                data: {
                    listId,
                    name: displayName,
                    quantity,
                    unit,
                    notes: notesParts.join(' | ') || null,
                    categoryId: categoryId,
                    createdByUserId: userId,
                },
                include: {
                    category: true
                }
            });
            createdItems.push(newItem);
        }

        return createdItems;
    }
}
