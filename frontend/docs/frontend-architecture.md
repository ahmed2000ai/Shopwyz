# Shopwyz Frontend Architecture

Tech stack:

- Framework: Next.js (App Router, TypeScript)
- UI: React + Tailwind CSS
- State: Local component state for now (later: React Query / Zustand if needed)
- Auth: JWT from backend `/auth/login`, stored in `localStorage` initially
- API calls: `fetch` wrappers using `NEXT_PUBLIC_API_BASE_URL`

## 1. Project Structure

Location: `/frontend`

Key folders:

- `src/app/`
  - Routing and pages
- `src/components/`
  - Reusable UI components (buttons, forms, layout, etc.)
- `src/lib/`
  - API client helpers, auth helpers, utility functions

## 2. Routing Plan (Initial)

- `/login`
  - Public login page.
  - Calls `POST /auth/login` on the backend.
  - On success, stores `accessToken` in `localStorage` under `shopwyz_token`.
  - Redirects to `/dashboard`.
- `/dashboard`
  - Simple authenticated landing page.
  - Later: show households & quick navigation.
- `/households`
  - List of user households.
- `/households/[householdId]/lists`
  - Lists for a given household.
- `/lists/[listId]`
  - Single list view:
    - Items grouped by category (as returned by backend).
    - Button / input to call AI “parse text and add items”.
- `/lists/[listId]/offers`
  - Best supermarket recommendation view (later).

## 3. Auth Handling (Frontend)

- Use backend endpoints:
  - `POST /auth/signup`
  - `POST /auth/login`
- On login:
  - Store `accessToken` in `localStorage` under `shopwyz_token`.
- For protected pages:
  - Read `shopwyz_token` on the client.
  - If missing, redirect to `/login`.
- For API calls:
  - Send `Authorization: Bearer <token>` header when token is present.

> NOTE: For now, accept storing JWT in `localStorage` for simplicity.
> Later we can switch to HttpOnly cookies if needed.

## 4. API Layer

Location: `src/lib/api.ts` (and friends).

- Expose small helper functions like:
  - `login(email, password)`
  - `getHouseholds()`
  - `getLists(householdId)`
  - `getListItems(listId)`
  - `parseTextAndAddItems(listId, text)`
  - `getListRecommendation(listId)`

All use `NEXT_PUBLIC_API_BASE_URL` + `fetch`.

## 5. UI Guidelines

- Use Tailwind classes for layout and spacing.
- Aim for:
  - Clean, simple layout
  - Mobile-first design (lists should work well on phone)
- Group list items visually by category:
  - Category heading (e.g. “Fruit & Vegetables”)
  - Items under that heading

## 6. AI-Agent Expectations (Frontend)

When using an AI agent to implement frontend features:

- Always treat these as the source of truth:
  - `docs/spec.md`
  - `docs/frontend-architecture.md`
  - `docs/feature-checklists.md` (Backend)
  - `docs/dev-ai-workflow.md`
- For backend contracts (routes, payloads):
  - Trust the NestJS backend in `/backend` and `prisma/schema.prisma`.

Before coding a frontend feature, the agent should:

1. Identify which backend endpoints it needs.
2. Confirm URL paths and payloads from:
   - `/backend/src/**`
   - `docs/backend-architecture.md`
3. Implement:
   - API helper(s) under `src/lib/`
   - UI under `src/app/` and/or `src/components/`.