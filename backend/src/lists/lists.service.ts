import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateListDto } from './dto/create-list.dto';
import { CreateListItemDto } from './dto/create-list-item.dto';

@Injectable()
export class ListsService {
    constructor(private readonly prisma: PrismaService) { }

    // Helper to check if user is member of household
    private async ensureUserInHousehold(userId: string, householdId: string) {
        const membership = await this.prisma.householdMember.findFirst({
            where: {
                userId,
                householdId,
            },
        });

        if (!membership) {
            throw new ForbiddenException('User is not a member of this household');
        }
    }

    // Create List
    async createList(householdId: string, userId: string, dto: CreateListDto) {
        await this.ensureUserInHousehold(userId, householdId);

        return this.prisma.list.create({
            data: {
                name: dto.name,
                householdId,
            },
        });
    }

    // Get Lists for Household
    async getLists(householdId: string, userId: string) {
        await this.ensureUserInHousehold(userId, householdId);

        return this.prisma.list.findMany({
            where: { householdId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    // Add Item to List
    async addItem(listId: string, userId: string, dto: CreateListItemDto) {
        // 1. Get List to find householdId
        const list = await this.prisma.list.findUnique({
            where: { id: listId },
            include: { household: true },
        });
        if (!list) {
            throw new NotFoundException('List not found');
        }

        // 2. Validate Membership
        await this.ensureUserInHousehold(userId, list.householdId);

        // 3. Resolve categoryId:
        //    - If dto.categoryId is provided, use it.
        //    - Else if productId is provided, inherit product.categoryId.
        let categoryId: string | null = dto.categoryId ?? null;

        if (!categoryId && dto.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: dto.productId },
                select: { categoryId: true },
            });
            if (product?.categoryId) {
                categoryId = product.categoryId;
            }
        }

        // 4. Create Item
        return this.prisma.listItem.create({
            data: {
                listId,
                name: dto.name,
                quantity: dto.quantity,
                unit: dto.unit,
                productId: dto.productId ?? null,
                categoryId,
                notes: dto.notes,
                createdByUserId: userId,
            },
            include: {
                category: true,
                product: {
                    include: { category: true },
                },
            },
        });
    }

    // Get List Items (Sorted)
    async getListItems(listId: string, userId: string) {
        // 1. Get List (and validation)
        const list = await this.prisma.list.findUnique({
            where: { id: listId },
            include: { household: true },
        });
        if (!list) {
            throw new NotFoundException('List not found');
        }

        await this.ensureUserInHousehold(userId, list.householdId);

        // 2. Fetch Items with Category + Product Category info
        const items = await this.prisma.listItem.findMany({
            where: { listId },
            include: {
                category: true,
                product: {
                    include: { category: true },
                },
            },
        });

        // 3. Application-side Sorting
        // Sort Order:
        // 1. Category.sortOrder (ASC) - Null/Unknown Categories LAST
        // 2. Category.name (ASC)
        // 3. Item.name (ASC)
        return items.sort((a, b) => {
            const catA = a.category || a.product?.category;
            const catB = b.category || b.product?.category;

            // Rule 1: Null categories last
            if (catA && !catB) return -1;
            if (!catA && catB) return 1;
            if (!catA && !catB) {
                // Both no category, sort by item name
                return a.name.localeCompare(b.name);
            }

            const validCatA = catA!;
            const validCatB = catB!;

            // Rule 2: sortOrder (nulls treated as very large)
            const orderA = validCatA.sortOrder ?? Number.MAX_SAFE_INTEGER;
            const orderB = validCatB.sortOrder ?? Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) return orderA - orderB;

            // Rule 3: Category Name
            const catNameCompare = validCatA.name.localeCompare(validCatB.name);
            if (catNameCompare !== 0) return catNameCompare;

            // Rule 4: Item Name
            return a.name.localeCompare(b.name);
        });
    }
}