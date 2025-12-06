import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, Unit, BaseUnit } from '@prisma/client';

describe('OffersController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userId: string;
    let listId: string;
    let storeAId: string; // Riyadh
    let storeBId: string; // Riyadh
    let storeCId: string; // Jeddah (should be ignored)

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Cleanup: children before parents
        await prisma.offer.deleteMany();
        await prisma.listItem.deleteMany();
        await prisma.list.deleteMany();
        await prisma.product.deleteMany();
        await prisma.supermarket.deleteMany();
        await prisma.householdMember.deleteMany();
        await prisma.household.deleteMany();
        await prisma.user.deleteMany();
        await prisma.category.deleteMany();

        // 1. Setup User & Household (Riyadh)
        const user = await prisma.user.create({
            data: { name: 'Rec User', email: 'rec@test.com', passwordHash: 'hash' },
        });
        userId = user.id;

        const household = await prisma.household.create({
            data: { name: 'Riyadh Home', city: 'Riyadh' },
        });

        await prisma.householdMember.create({
            data: { userId, householdId: household.id, role: Role.OWNER },
        });

        const cat = await prisma.category.create({
            data: { name: 'Dairy', sortOrder: 1 },
        });

        // 2. Setup Supermarkets
        const storeA = await prisma.supermarket.create({
            data: { name: 'Store A', city: 'Riyadh' },
        });
        storeAId = storeA.id;

        const storeB = await prisma.supermarket.create({
            data: { name: 'Store B', city: 'Riyadh' },
        });
        storeBId = storeB.id;

        const storeC = await prisma.supermarket.create({
            data: { name: 'Store C', city: 'Jeddah' },
        });
        storeCId = storeC.id;

        // 3. Setup Product (Milk 1L, base 1000 ML)
        const product = await prisma.product.create({
            data: {
                name: 'Fresh Milk',
                brand: 'Almarai',
                categoryId: cat.id,
                sizeValue: 1,
                sizeUnit: Unit.L,
                baseUnit: BaseUnit.ML,
                baseUnitPerItem: 1000,
            },
        });

        // 4. Setup List & Item (2x Milk)
        const list = await prisma.list.create({
            data: { name: 'Weekly', householdId: household.id },
        });
        listId = list.id;

        await prisma.listItem.create({
            data: {
                listId,
                name: 'Milk',
                productId: product.id, // linked to Product
                quantity: 2,
                unit: Unit.L,
                createdByUserId: userId,
            },
        });

        // 5. Setup Offers (valid dates)
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        // Store A: 1L for 10 SAR (10 / 1000 = 0.01 per ML)
        await prisma.offer.create({
            data: {
                supermarketId: storeA.id,
                productId: product.id,
                offerPrice: 10,
                originalPrice: 10,
                currency: 'SAR',
                sizeValue: 1,
                sizeUnit: Unit.L,
                startDate: yesterday,
                endDate: tomorrow,
            },
        });

        // Store B: 500ML for 4 SAR (4 / 500 = 0.008 per ML) -> cheaper per unit
        await prisma.offer.create({
            data: {
                supermarketId: storeB.id,
                productId: product.id,
                offerPrice: 4,
                originalPrice: 5,
                currency: 'SAR',
                sizeValue: 500,
                sizeUnit: Unit.ML,
                startDate: yesterday,
                endDate: tomorrow,
            },
        });

        // Store C: 1L for 1 SAR – CHEAP but wrong city (Jeddah, should be ignored)
        await prisma.offer.create({
            data: {
                supermarketId: storeC.id,
                productId: product.id,
                offerPrice: 1,
                originalPrice: 1,
                currency: 'SAR',
                sizeValue: 1,
                sizeUnit: Unit.L,
                startDate: yesterday,
                endDate: tomorrow,
            },
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('/lists/:id/recommendation (GET) - Validates Best Store', async () => {
        const res = await request(app.getHttpServer())
            .get(`/lists/${listId}/recommendation`)
            .set('x-user-id', userId)
            .expect(200);

        const recs = res.body.supermarkets;
        expect(Array.isArray(recs)).toBe(true);

        // Should only return Riyadh stores (A and B)
        expect(recs.length).toBe(2);
        const names = recs.map((r: any) => r.supermarketName).sort();
        expect(names).toEqual(['Store A', 'Store B']); // C is excluded by city

        const first = recs[0];
        const second = recs[1];

        // First supermarket should have the lowest totalCost (best basket price)
        expect(first.totalCost).toBeLessThanOrEqual(second.totalCost);

        // Total costs should be positive numbers
        expect(first.totalCost).toBeGreaterThan(0);
        expect(second.totalCost).toBeGreaterThan(0);
    });
});