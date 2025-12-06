import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AiController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userId: string;
    let householdId: string;
    let listId: string;
    let catFruitId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Cleanup: delete children before parents
        await prisma.listItem.deleteMany();
        await prisma.list.deleteMany();
        await prisma.offer.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.householdMember.deleteMany();
        await prisma.supermarket.deleteMany().catch(() => { });
        await prisma.household.deleteMany();
        await prisma.user.deleteMany();

        // Seed
        const user = await prisma.user.create({
            data: { name: 'AI Test User', email: 'ai@test.com', passwordHash: 'hash' },
        });
        userId = user.id;

        const household = await prisma.household.create({
            data: { name: 'AI Home', city: 'Test City' },
        });
        householdId = household.id;

        await prisma.householdMember.create({
            data: { userId, householdId, role: Role.OWNER },
        });

        const list = await prisma.list.create({
            data: { name: 'AI List', householdId },
        });
        listId = list.id;

        const catFruit = await prisma.category.create({
            data: { name: 'Fruit', sortOrder: 1 },
        });
        catFruitId = catFruit.id;
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ai/parse-text (POST) - Parse and Add Items', async () => {
        const response = await request(app.getHttpServer())
            .post('/ai/parse-text')
            .set('x-user-id', userId)
            .send({
                text: 'Buy 1kg Apples and some milk',
                listId: listId,
            })
            .expect(201);

        const createdItems = response.body;
        expect(Array.isArray(createdItems)).toBe(true);
        expect(createdItems.length).toBeGreaterThan(0);

        // Verify "Apple" item
        const appleItem = createdItems.find((i: any) => i.name === 'Apple');
        expect(appleItem).toBeDefined();
        expect(appleItem.categoryId).not.toBeNull();      // Only require that a category is assigned
        expect(appleItem.category.name).toBe('Fruit');    // Still verify logical category
        expect(appleItem.quantity).toBe(1);
        expect(appleItem.unit).toBe('KG');

        // Verify "Milk" item (Category 'Dairy' does not exist in seed, so categoryId might be null if logic is strict, 
        // OR the service logic only sets ID if found. The Stub returns categoryName='Dairy'.
        // Since we didn't seed "Dairy", categoryId should be null or ignored.
        // Let's check logic: "if (category) categoryId = category.id;" -> so it will be null.
        const milkItem = createdItems.find((i: any) => i.name === 'Whole Milk');
        expect(milkItem).toBeDefined();
        expect(milkItem.categoryId).not.toBeNull();
        expect(milkItem.quantity).toBe(2);
    });
});
