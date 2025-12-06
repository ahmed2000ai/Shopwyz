import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, Unit } from '@prisma/client';

describe('ListsController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userId: string;
    let householdId: string;
    let listId: string;
    let catFruitId: string;
    let catCandyId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Cleanup
        await prisma.listItem.deleteMany();
        await prisma.list.deleteMany();
        await prisma.offer.deleteMany();          // NEW: offers depend on product & supermarket
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.householdMember.deleteMany();
        await prisma.supermarket.deleteMany().catch(() => { }); // optional, if used in this test
        await prisma.household.deleteMany();
        await prisma.user.deleteMany().catch(() => { });        // optional, if user created in this test

        // Seed
        const user = await prisma.user.create({
            data: { name: 'E2E User', email: 'e2e@test.com', passwordHash: 'hash' },
        });
        userId = user.id;

        const household = await prisma.household.create({
            data: { name: 'E2E Home', city: 'Test City' },
        });
        householdId = household.id;

        await prisma.householdMember.create({
            data: { userId, householdId, role: Role.OWNER },
        });

        // Categories
        // Fruit: Sort 1
        // Candy: Sort 2
        const catFruit = await prisma.category.create({
            data: { name: 'Fruit', sortOrder: 1 },
        });
        catFruitId = catFruit.id;

        const catCandy = await prisma.category.create({
            data: { name: 'Candy', sortOrder: 2 },
        });
        catCandyId = catCandy.id;
    });

    afterAll(async () => {
        await app.close();
    });

    it('/households/:id/lists (POST) - Create List', async () => {
        const res = await request(app.getHttpServer())
            .post(`/households/${householdId}/lists`)
            .set('x-user-id', userId)
            .send({ name: 'Weekly Groceries' })
            .expect(201);

        expect(res.body.name).toBe('Weekly Groceries');
        expect(res.body.householdId).toBe(householdId);
        listId = res.body.id;
    });

    it('/households/:id/lists (GET) - List Lists', async () => {
        const res = await request(app.getHttpServer())
            .get(`/households/${householdId}/lists`)
            .set('x-user-id', userId)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(listId);
    });

    it('/lists/:id/items (POST) - Add Items with Categories', async () => {
        // 1. Add Candy (Order 2)
        await request(app.getHttpServer())
            .post(`/lists/${listId}/items`)
            .set('x-user-id', userId)
            .send({
                name: 'Chocolate Bar',
                quantity: 1,
                unit: Unit.PCS,
                categoryId: catCandyId
            })
            .expect(201);

        // 2. Add Uncategorized Item (Should be Last)
        await request(app.getHttpServer())
            .post(`/lists/${listId}/items`)
            .set('x-user-id', userId)
            .send({
                name: 'Mystery Item',
                quantity: 1,
                unit: Unit.PCS
            })
            .expect(201);

        // 3. Add Fruit (Order 1) - Should be First
        await request(app.getHttpServer())
            .post(`/lists/${listId}/items`)
            .set('x-user-id', userId)
            .send({
                name: 'Apple',
                quantity: 1,
                unit: Unit.KG,
                categoryId: catFruitId
            })
            .expect(201);
    });

    it('/lists/:id/items (GET) - Verify Sort Order', async () => {
        const res = await request(app.getHttpServer())
            .get(`/lists/${listId}/items`)
            .set('x-user-id', userId)
            .expect(200);

        const items = res.body;
        expect(items.length).toBe(3);

        // Expected Order: Fruit (1) -> Candy (2) -> Uncategorized (Null)
        expect(items[0].name).toBe('Apple');
        expect(items[0].category.name).toBe('Fruit');

        expect(items[1].name).toBe('Chocolate Bar');
        expect(items[1].category.name).toBe('Candy');

        expect(items[2].name).toBe('Mystery Item');
        expect(items[2].category).toBeNull();
    });
});
