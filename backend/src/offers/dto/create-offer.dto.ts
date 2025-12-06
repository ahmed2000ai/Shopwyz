import { Unit } from '@prisma/client';

export class CreateOfferDto {
    supermarketId: string;
    productId: string;
    offerPrice: number;
    originalPrice: number;
    currency: string;
    sizeValue: number;
    sizeUnit: Unit;
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
}
