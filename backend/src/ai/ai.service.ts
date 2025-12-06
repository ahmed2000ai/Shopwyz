import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ParseTextDto } from './dto/parse-text.dto';
import { Unit } from '@prisma/client';

interface ParsedItem {
    name: string;
    quantity: number;
    unit: Unit;
    notes?: string;
    categoryName?: string;
    brandPreference?: string;
}

@Injectable()
export class AiService {
    constructor(private prisma: PrismaService) { }

    // Stub LLM call
    // In real implementation, this would call OpenAI/Gemini
    private async stubParseText(text: string): Promise<ParsedItem[]> {
        // Simple regex or keyword matching for demo purposes
        // Returns static data if text contains specific keywords, or a default item
        const items: ParsedItem[] = [];

        const lowerText = text.toLowerCase();

        if (lowerText.includes('apple') || lowerText.includes('fruit')) {
            items.push({
                name: 'Apple',
                quantity: 1,
                unit: Unit.KG,
                categoryName: 'Fruit',
            });
        }

        if (lowerText.includes('milk')) {
            items.push({
                name: 'Whole Milk',
                quantity: 2,
                unit: Unit.L,
                categoryName: 'Dairy',
                notes: 'Low fat if possible',
            });
        }

        if (lowerText.includes('bread')) {
            items.push({
                name: 'Sourdough Bread',
                quantity: 1,
                unit: Unit.PCS,
                categoryName: 'Bakery',
            });
        }

        // Fallback if empty/unknown
        if (items.length === 0) {
            items.push({
                name: text.substring(0, 50), // Truncate if too long
                quantity: 1,
                unit: Unit.PCS,
                notes: 'Parsed as generic item',
            });
        }

        return items;
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

        // 2. Parse Text (Stub)
        const parsedItems = await this.stubParseText(text);

        // 3. Create Items & Resolve Categories
        // We do this sequentially to keep logic simple, or promise.all
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

            // Create Item
            const newItem = await this.prisma.listItem.create({
                data: {
                    listId,
                    name: pItem.name,
                    quantity: pItem.quantity,
                    unit: pItem.unit,
                    notes: pItem.notes,
                    categoryId: categoryId,
                    createdByUserId: userId,
                    // We ignore brandPreference for now as per schema (it might go to notes or preferences)
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
