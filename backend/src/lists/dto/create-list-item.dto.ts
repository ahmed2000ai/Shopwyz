import { Unit } from '@prisma/client';

export class CreateListItemDto {
    name: string;
    quantity: number;
    unit: Unit;
    productId?: string;
    categoryId?: string;
    notes?: string;
}
