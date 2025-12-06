import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Unit } from '@prisma/client';

@Injectable()
export class OffersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateOfferDto) {
        return this.prisma.offer.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
            },
        });
    }

    // --- Recommendation Logic ---

    private getBaseUnitFactor(unit: Unit): number {
        // Convert everything to its base unit relative scale
        // KG -> 1000 G
        // G -> 1 G
        // L -> 1000 ML
        // ML -> 1 ML
        // PCS -> 1 (assume single item)
        // PACK -> 1 (assume 1 pack as a unit)
        switch (unit) {
            case Unit.KG:
                return 1000;
            case Unit.G:
                return 1;
            case Unit.L:
                return 1000;
            case Unit.ML:
                return 1;
            case Unit.PCS:
                return 1;
            case Unit.PACK:
                return 1;
            default:
                return 1;
        }
    }

    /**
     * Public API used by the controller.
     * This is what RecommendationController should call.
     */
    async getBestSupermarketForList(listId: string, userId: string) {
        return this.getRecommendation(listId, userId);
    }

    /**
     * Core recommendation implementation.
     */
    private async getRecommendation(listId: string, userId: string) {
        // 1. Resolve List & Household & City
        const list = await this.prisma.list.findUnique({
            where: { id: listId },
            include: {
                items: {
                    include: { product: true },
                },
                household: true,
            },
        });
        if (!list) throw new NotFoundException('List not found');

        // 2. Validate Membership
        const membership = await this.prisma.householdMember.findUnique({
            where: {
                userId_householdId: { userId, householdId: list.householdId },
            },
        });
        if (!membership) throw new ForbiddenException('Access denied');

        const city = list.household.city;

        // 3. Get Supermarkets in City
        const supermarkets = await this.prisma.supermarket.findMany({
            where: { city: { equals: city, mode: 'insensitive' } },
        });

        if (supermarkets.length === 0) {
            return {
                listId,
                city,
                supermarkets: [],
            };
        }

        const today = new Date();
        const recommendations: any[] = [];

        // 4. Calculate Cost per Supermarket
        for (const store of supermarkets) {
            let totalCost = 0;
            let totalDiscount = 0;
            const itemBreakdown: any[] = [];

            for (const item of list.items) {
                // Need productId to check offers
                if (!item.productId) {
                    itemBreakdown.push({
                        itemId: item.id,
                        status: 'no_product_link',
                        cost: 0,
                    });
                    continue;
                }

                const product = item.product;
                if (!product) {
                    itemBreakdown.push({
                        itemId: item.id,
                        status: 'no_product_found',
                        cost: 0,
                    });
                    continue;
                }

                // Find valid offers
                const offers = await this.prisma.offer.findMany({
                    where: {
                        supermarketId: store.id,
                        productId: product.id,
                        startDate: { lte: today },
                        endDate: { gte: today },
                    },
                });

                // Find best offer by price-per-normalized-unit
                let bestOffer: any = null;
                let bestPricePerUnit = Number.MAX_VALUE;

                for (const offer of offers) {
                    const factor = this.getBaseUnitFactor(offer.sizeUnit);
                    const normalizedSize = offer.sizeValue * factor; // normalized to ML or G
                    const pricePerUnit = offer.offerPrice / normalizedSize;

                    if (pricePerUnit < bestPricePerUnit) {
                        bestPricePerUnit = pricePerUnit;
                        bestOffer = offer;
                    }
                }

                if (bestOffer) {
                    const itemFactor = this.getBaseUnitFactor(item.unit);
                    const itemNormalizedQty = item.quantity * itemFactor;

                    const cost = itemNormalizedQty * bestPricePerUnit;

                    const offerFactor = this.getBaseUnitFactor(bestOffer.sizeUnit);
                    const offerNormSize = bestOffer.sizeValue * offerFactor;
                    const origPricePerUnit = bestOffer.originalPrice / offerNormSize;

                    const discountPerUnit = Math.max(
                        0,
                        origPricePerUnit - bestPricePerUnit,
                    );
                    const discount = discountPerUnit * itemNormalizedQty;

                    totalCost += cost;
                    totalDiscount += discount;

                    itemBreakdown.push({
                        itemId: item.id,
                        name: item.name,
                        offerId: bestOffer.id,
                        priceUsed: bestOffer.offerPrice,
                        calculatedCost: cost,
                    });
                } else {
                    itemBreakdown.push({
                        itemId: item.id,
                        name: item.name,
                        status: 'unavailable',
                        cost: 0,
                    });
                }
            }

            recommendations.push({
                supermarketId: store.id,
                supermarketName: store.name,
                totalCost,
                totalDiscount,
                items: itemBreakdown,
            });
        }

        // 5. Rank by totalCost ascending
        recommendations.sort((a, b) => a.totalCost - b.totalCost);

        return {
            listId,
            householdId: list.householdId,
            city,
            supermarkets: recommendations,
        };
    }
}