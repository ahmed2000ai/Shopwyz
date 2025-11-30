```markdown
# Shopwyz – Backend Initialization Plan (AI-Safe)

This document defines the exact, safe, repeatable process for initializing the NestJS backend under `/backend`.

Any AI coding assistant generating or modifying the backend must follow these steps.

---

# 1. Backend Folder Requirements

- The backend **must** be located at:

```

/backend

```

- This folder will contain the NestJS project scaffolded by Nest CLI.
- **Do not create additional backend folders** (e.g., `/api`, `/server`, `/nest`).
- **Do not store docs or prisma schema inside `/backend`**.

The existing folders at repo root:
```

docs/
prisma/
README.md

````
must not be modified or moved by backend scaffolding.

---

# 2. Steps to Initialize the Backend

## Step A — Install Nest CLI (only if not installed globally)

```bash
npm install -g @nestjs/cli
````

## Step B — Generate NestJS project in `/backend`

From the repo root:

```bash
nest new backend
```

* AI must not scaffold the project anywhere else.
* When asked for package manager, choose **npm** unless told otherwise.

This creates:

```
backend/
  src/
  test/
  package.json
  tsconfig.json
  nest-cli.json
  ...
```

## Step C — Install Prisma inside `/backend`

From:

```bash
cd backend
```

Run:

```bash
npm install prisma @prisma/client
```

## Step D — Generate Prisma client using root schema

```bash
npx prisma generate --schema=../prisma/schema.prisma
```

## Step E — Verify environment config

The backend should use a `.env` file **inside `/backend`** containing:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public
```

The backend should load this via `@nestjs/config` or a similar module.

> AI must not invent a different env structure.

---

# 3. Add Prisma Module to NestJS App

AI should create:

```
backend/src/prisma/prisma.module.ts
backend/src/prisma/prisma.service.ts
```

`PrismaService` should:

* Import PrismaClient from `@prisma/client`
* Extend it (optional) for middleware
* Use `DATABASE_URL` via environment variables

Example skeleton (to be implemented later):

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`prisma.module.ts` registers this as a provider.

---

# 4. Required Backend Scripts

After initialization, `backend/package.json` must contain:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "lint": "nest lint",
    "test": "nest test",
    "test:e2e": "nest test:e2e",
    "prisma:generate": "prisma generate --schema=../prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev --schema=../prisma/schema.prisma"
  }
}
```

AI must **preserve** these when modifying scripts.

---

# 5. Backend Verification Checklist

Before coding modules, confirm:

* [ ] `/backend` folder exists.
* [ ] NestJS project scaffolding is present.
* [ ] Prisma installed in `/backend`.
* [ ] `prisma/schema.prisma` exists at repo root.
* [ ] `npx prisma generate --schema=../prisma/schema.prisma` works.
* [ ] `.env` exists inside `/backend` with valid `DATABASE_URL`.
* [ ] `PrismaModule` and `PrismaService` exist.
* [ ] Nest app can start with no errors: `npm run start:dev`.

When these items are checked, backend implementation can begin.

---

# 6. What the AI Must NEVER Do

* ❌ Do NOT scaffold backend anywhere except `/backend`
* ❌ Do NOT move or rewrite existing docs
* ❌ Do NOT recreate `prisma/schema.prisma` inside `/backend`
* ❌ Do NOT generate a second Prisma schema
* ❌ Do NOT invent a new folder structure
* ❌ Do NOT overwrite `backend` with unrelated code
* ❌ Do NOT delete or modify root docs

If unsure, the AI must ask for clarification.

---

# 7. After Initialization

Once all steps are complete, development proceeds according to:

* `docs/backend-architecture.md`
* `docs/feature-checklists.md`

The first modules to implement:

1. `auth/`
2. `users/`
3. `households/`
4. `lists/`

(With tests and checklists.)
