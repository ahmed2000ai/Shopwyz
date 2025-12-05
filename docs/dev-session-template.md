# Shopwyz – AI Dev Session Template

This file defines a standard prompt/template to use at the start of each coding session with an AI assistant (e.g. ChatGPT, VS Code AI, etc.).

Copy, adapt, and paste this into the AI chat at the beginning of each session.

---

## 1. Standard Session Kickoff Prompt

> You are helping me develop the Shopwyz backend.
> 
> Before doing ANY coding, read and respect these documents:
> - docs/spec.md
> - docs/backend-architecture.md
> - docs/prisma-models-plan.md
> - docs/dev-ai-workflow.md
> - docs/feature-checklists.md
> - docs/backend-setup.md
> - prisma/schema.prisma
> 
> Treat them as the source of truth.  
> Do NOT invent behavior that conflicts with them.
> 
> Today’s goal:
> - [Describe today’s goal here, e.g. “Implement basic Household module with create + list for current user”]
> 
> Constraints:
> - Use NestJS (TypeScript) in /backend only.
> - Use Prisma with the existing prisma/schema.prisma at repo root.
> - Follow the relevant feature checklist from docs/feature-checklists.md.
> - Write or update tests where appropriate.
> - At the end, summarize:
>   - What was implemented
>   - Which checklist items are done / not done / partial
>   - Any limitations or TODOs
> 
> First, tell me:
> 1. Which files you need to see to start.
> 2. Which feature checklist you will use.
> 3. A short plan (3–7 steps) for this session.

---

## 2. Per-Feature Prompt Add-On

When working on a specific feature (e.g. Lists, Offers, Preferences), add this:

> For this session, focus ONLY on this feature:
> 
> - [Feature name, e.g. “Lists & Items – List CRUD and List Item CRUD”]
> 
> Use the corresponding section from docs/feature-checklists.md.  
> Copy the checklist here, and for each item mark it later as:
> - ✔ implemented fully
> - ✖ not implemented
> - ~ partially implemented
> 
> Do NOT work on other modules unless required for this feature to function.

---

## 3. Code Change Format

Ask the AI to present changes in a structured way:

> When you propose changes:
> - Show the file path.
> - Show the BEFORE → AFTER code for each relevant part, or just the new content for new files.
> - Keep changes focused and minimal.
> - After code, include:
>   - Updated checklist with ✔ / ✖ / ~
>   - Any new tests added or updated.
>   - A suggested commit message.

Example request:

> “Now implement the service + controller layer for this feature, update tests, and then show me:
> > 1. All changed/created files.
> > 2. Updated checklist.
> > 3. Suggested commit message.”

---

## 4. Session Closing Template

At the end of a session, ask:

> Summarize this session:
> - Files created/modified.
> - Which checklist items are ✔ / ✖ / ~.
> - Any shortcuts or assumptions you made.
> - Suggested commit message.
> 
> Also suggest what the next logical session should focus on.

You can paste this into your next session as context.

---

## 5. Example Concrete Session Prompt

Example: First backend feature – Households (create & list)

> You are helping me implement the Shopwyz backend in /backend.
> 
> Today’s goal:
> - Implement basic Household module:
>   - Create household
>   - List households for the current user
>   - Enforce basic auth + household scoping
> 
> Use docs:
> - docs/spec.md
> - docs/backend-architecture.md
> - docs/feature-checklists.md (Households & Auth section)
> - prisma/schema.prisma
> 
> Steps:
> 1. Copy the “Create Household” checklist from docs/feature-checklists.md and paste it here.
> 2. Propose a short implementation plan (5–7 steps).
> 3. Show me the NestJS module/controller/service skeleton you will create in /backend/src/households.
> 4. Implement the code, referencing Prisma models from schema.prisma.
> 5. Add or update tests.
> 6. Update the checklist with ✔ / ✖ / ~.
> 7. Provide a suggested commit message.

---

## 6. Example – Session 0: Backend Scaffolding & Prisma Wiring

Use this prompt for the very first backend coding session, where the AI sets up the NestJS project in `/backend` and wires Prisma.

> You are helping me set up the initial backend for the Shopwyz project.
> 
> Do NOT invent your own structure. Follow these documents as the source of truth:
> - docs/backend-setup.md
> - docs/backend-init-plan.md
> - docs/backend-architecture.md
> - prisma/schema.prisma
> - docs/dev-ai-workflow.md
> 
> **Goal of this session (Session 0):**
> - Scaffold a NestJS project in `/backend` using `nest new backend`.
> - Install and wire Prisma & @prisma/client using the existing `../prisma/schema.prisma`.
> - Create `PrismaModule` and `PrismaService` in `backend/src/prisma`.
> - Add the expected npm scripts for Prisma in `backend/package.json`.
> - Ensure the backend can start (`npm run start:dev`) without errors (even if DB is not yet available).
> 
> **Constraints:**
> - The backend MUST live in `/backend`.
> - DO NOT move or recreate `prisma/schema.prisma`.
> - DO NOT modify or move anything in `/docs`.
> - Use `DATABASE_URL` from `.env` (assume it will be provided later).
> 
> **Steps you should follow:**
> 1. Summarize the plan you will follow in 5–7 steps based on the docs above.
> 2. Show the command sequence needed (`nest new backend`, prisma install, prisma generate, etc.).
> 3. Show the new/updated files:
>    - `backend/package.json` (with Prisma scripts)
>    - `backend/src/prisma/prisma.module.ts`
>    - `backend/src/prisma/prisma.service.ts`
>    - Any bootstrapping changes needed for `.env` config loading.
> 4. Confirm how Prisma commands reference `../prisma/schema.prisma`.
> 5. Provide a suggested commit message at the end (e.g. `chore: scaffold NestJS backend and wire Prisma`).
> 
> Before writing code, restate the checklist from docs/backend-init-plan.md and mark items as ✔ / ✖ / ~ at the end of the session.

--

## 7. Quick Copy Mini-Prompt (for lazy days)

When you don’t want to think too much, you can just paste this:

> You are working on the Shopwyz project.  
> Always follow these files as spec:
> - docs/spec.md
> - docs/backend-architecture.md
> - docs/feature-checklists.md
> - prisma/schema.prisma
> 
> For this session, our goal is:
> - [Describe goal]
> 
> Steps:
> 1. Identify the relevant feature checklist and paste it here.
> 2. Propose a small plan.
> 3. Implement in /backend with NestJS + Prisma.
> 4. Update the checklist.
> 5. Suggest a commit message.
> 
> Do NOT implement anything outside this scope unless absolutely required.
