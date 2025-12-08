# Frontend Feature Checklists – Shopwyz

This file defines small, concrete checklists for the AI agent when implementing frontend features in `/frontend`.

The agent must:
- Always read `docs/frontend-architecture.md` before implementing.
- Treat backend contracts as defined by `/backend` and `prisma/schema.prisma`.
- Update the checklist with ✔ / ✖ / ~ at the end of each session.

---

## 1. Auth UI – Login Page

Goal: A working login page at `/login` that talks to the backend.

- [x] Create `src/lib/api.ts` (or extend it if it exists) with:
  - [x] `login(email: string, password: string): Promise<{ accessToken: string }>`
  - [x] Use `NEXT_PUBLIC_API_BASE_URL` and `fetch`.
- [x] Create a `LoginPage` at `src/app/login/page.tsx`:
  - [x] Email + password fields.
  - [x] Submit button.
  - [x] Calls `login()` on submit.
  - [x] On success:
    - [x] Store `accessToken` in `localStorage` under `shopwyz_token`.
    - [x] Redirect to `/dashboard`.
  - [x] Show error message on failure.
- [x] Add a very basic `/dashboard` page:
  - [x] Reads `shopwyz_token` from `localStorage`.
  - [x] If missing, redirects to `/login`.
  - [x] Shows a placeholder “You are logged in” message.

---

## 2. Household List Page – `/households`

Goal: Show all households for the current user.

- [ ] Add `getHouseholds()` to `src/lib/api.ts`:
  - [ ] Calls `GET /households` (or appropriate endpoint).
  - [ ] Sends `Authorization: Bearer <token>` header.
- [ ] Create `src/app/households/page.tsx`:
  - [ ] On mount, read `shopwyz_token`.
    - [ ] If missing, redirect to `/login`.
  - [ ] Call `getHouseholds()` and display:
    - [ ] Household name.
    - [ ] City (if available).
  - [ ] Clicking a household row navigates to `/households/[householdId]/lists`.

---

## 3. Household Lists Page – `/households/[householdId]/lists`

Goal: Show lists for a given household and allow creating a new one.

- [ ] Add `getLists(householdId)` and `createList(householdId, name)` to `src/lib/api.ts`.
- [ ] Create `src/app/households/[householdId]/lists/page.tsx`:
  - [ ] Extract `householdId` from route params.
  - [ ] Load lists for that household.
  - [ ] Display list names and basic metadata.
  - [ ] Provide an input + button to create a new list.
  - [ ] After creating, refresh the list.

---

## 4. List Detail Page – `/lists/[listId]`

Goal: Show items for a list, grouped by category, and allow adding items via AI.

- [ ] Add API helpers:
  - [ ] `getListItems(listId)`
  - [ ] `parseTextAndAddItems(listId, text)` that calls backend AI endpoint.
- [ ] Create `src/app/lists/[listId]/page.tsx`:
  - [ ] Load items for the list.
  - [ ] Group items by category name (using the backend response structure).
  - [ ] Render categories with headings and their items under them.
  - [ ] Provide a text area + button:
    - [ ] User types “2kg chicken, snacks for kids…”
    - [ ] Call `parseTextAndAddItems(listId, text)`.
    - [ ] On success, reload items.
- [ ] Show a simple loading / error state.

---

## 5. Best Supermarket Recommendation – `/lists/[listId]/offers`

Goal: Show recommended supermarkets for the list.

- [ ] Add `getListRecommendation(listId)` to `src/lib/api.ts`.
- [ ] Create `src/app/lists/[listId]/offers/page.tsx`:
  - [ ] Load recommendation data.
  - [ ] Display supermarkets sorted by total cost.
  - [ ] For each:
    - [ ] Show store name.
    - [ ] Show total cost.
    - [ ] Optionally show number of items covered vs unavailable.

---

## 6. AI-Agent Usage Instructions (Frontend)

Before implementing or modifying any frontend feature, the AI agent MUST:

1. Identify the relevant checklist section from this file.
2. Paste the checklist into the chat and mark it as the current target.
3. Propose a short implementation plan (5–7 steps).
4. Implement code only in `/frontend`:
   - `src/app/**`
   - `src/components/**`
   - `src/lib/**`
5. After coding:
   - Update the checklist with ✔ / ✖ / ~.
   - Suggest a commit message.