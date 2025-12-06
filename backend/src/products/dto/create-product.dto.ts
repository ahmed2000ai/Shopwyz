import { Unit, BaseUnit } from '@prisma/client';

export class CreateProductDto {
    name: string;
    brand: string;
    categoryId: string;
    sizeValue: number;
    sizeUnit: Unit;
    baseUnit: BaseUnit;
    baseUnitPerItem: number;
}
