# Shopwyz

````markdown
# Shopwyz 🛒

Shopwyz is a smart, shared grocery app for households.

- Multiple users in the same household collaborate on shared grocery lists.
- Natural language (text/voice) input is converted into structured items.
- The system learns preferences over time (brands, sizes, frequency).
- It uses supermarket offers to recommend the **best supermarket** for the list, based on:
  - User’s city
  - Price per unit (handles different package sizes)
  - Available promotions

This repo contains:

- Product & architecture docs
- Prisma schema
- (Soon) NestJS backend code under `/backend`
- (Later) Frontend and mobile apps

---

## 1. Key Documents

These are the **single sources of truth** for the project:

- 📜 **Product spec** – overall vision, entities, and flows  
  `docs/spec.md`

- 🧱 **Backend architecture** – modules, responsibilities, endpoints  
  `docs/backend-architecture.md`

- 🗂️ **Prisma models plan** – human-readable data model design  
  `docs/prisma-models-plan.md`

- 🧬 **Prisma schema** – actual database schema  
  `prisma/schema.prisma`

- 🤖 **AI coding workflow** – how AI assistants should behave when coding  
  `docs/dev-ai-workflow.md`

- ✅ **Feature checklists** – detailed implementation checklists per feature  
  `docs/feature-checklists.md`

- 🛠️ **Backend setup** – how to create & wire the NestJS backend  
  `docs/backend-setup.md`

If you’re new to the project, read them roughly in this order:

1. `docs/spec.md`
2. `docs/backend-architecture.md`
3. `docs/prisma-models-plan.md`
4. `docs/dev-ai-workflow.md`
5. `docs/feature-checklists.md`

---

## 2. Backend Overview (NestJS + Prisma)

Backend stack (decided):

- **NestJS (TypeScript)** – API server
- **PostgreSQL** – database
- **Prisma** – ORM / schema
- **WebSockets** – realtime list updates
- **REST JSON API** – consumed by web & mobile clients

Backend location:

```text
/backend
````

Planned module structure (inside `backend/src`):

* `auth/`
* `users/`
* `households/`
* `lists/`
* `products/`
* `supermarkets/`
* `offers/`
* `preferences/`
* `ai/`
* `realtime/`

For detailed responsibilities, see:
`docs/backend-architecture.md`

---

## 3. Database (Prisma + PostgreSQL)

The Prisma schema lives at:

```text
prisma/schema.prisma
```

It defines models such as:

* `User`
* `Household`
* `HouseholdMember`
* `List`
* `ListItem`
* `Product`
* `Supermarket`
* `Offer`
* `Preference`

These models are derived from:
`docs/prisma-models-plan.md`

When you have a database connection ready, you can run (from `/backend`):

```bash
npx prisma generate --schema=../prisma/schema.prisma
npx prisma migrate dev --schema=../prisma/schema.prisma
```

---

## 4. Setting Up the Backend

Full setup steps are in:
`docs/backend-setup.md`

High-level:

1. From repo root, create NestJS app in `/backend`:

   ```bash
   npm install -g @nestjs/cli
   nest new backend
   ```

2. Inside `/backend`, install Prisma and the client:

   ```bash
   cd backend
   npm install prisma @prisma/client
   npx prisma generate --schema=../prisma/schema.prisma
   ```

3. Add `DATABASE_URL` to your `.env` (root or backend, depending on your setup).

4. Create `PrismaModule` and `PrismaService` in `backend/src/prisma`.

---

## 5. How AI Coding Assistants Should Work on This Repo

Any AI assistant working on this repo should:

1. Read these docs (or be given their content):

   * `docs/spec.md`
   * `docs/backend-architecture.md`
   * `docs/prisma-models-plan.md`
   * `docs/dev-ai-workflow.md`
   * `docs/feature-checklists.md`

2. Follow `docs/dev-ai-workflow.md`:

   * Use **checklist-driven development**.
   * Derive tests from the spec before implementing complex logic.
   * Explicitly report what is **not implemented** or **only partially implemented**.

3. Use `docs/feature-checklists.md`:

   * Copy the relevant feature checklist before coding.
   * Update it after coding (✔, ✖, partial).

4. Never invent behavior not defined in the spec:

   * If something is unclear → ask or mark as TBD.
   * Respect the **Non-Negotiable Rules** in `docs/spec.md`.

5. Stay within the planned architecture:

   * Use `/backend` for NestJS code.
   * Use `prisma/schema.prisma` for data models.
   * Do not introduce conflicting models or random folder structures.

---

## 6. Roadmap (High-Level)

1. 🧱 Bootstrap NestJS backend in `/backend`.
2. 🔐 Implement Auth + Users.
3. 🏠 Implement Households (city-based).
4. 📝 Implement Lists & ListItems + realtime updates.
5. 🏬 Implement Products, Supermarkets, and Offers.
6. 💰 Implement best-supermarket recommendation logic.
7. 🤖 Add AI parsing for natural-language input.
8. 🧠 Add Preferences and suggestions.

More details in:
`docs/backend-architecture.md` and `docs/feature-checklists.md`.

---

## 7. Future: Frontend & Mobile

Planned tech:

* Web: **Next.js (TypeScript)**
* Mobile: **React Native (Expo)**

Both will talk to the same backend API + WebSockets.

---

If you are an AI assistant reading this:
**Do not start coding until you’ve aligned your understanding with `docs/spec.md` and `docs/dev-ai-workflow.md`.**
