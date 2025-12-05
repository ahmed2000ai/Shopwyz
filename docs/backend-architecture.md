````markdown
# Shopwyz – Backend Architecture

## 1. Overview

**Backend stack (decided):**

- Framework: **NestJS (TypeScript)**
- Database: **PostgreSQL**
- ORM: **Prisma**
- Realtime: **WebSockets (Socket.IO or NestJS Gateway)**
- API style: **REST** (JSON), with the option to add GraphQL later
- Auth: External provider (e.g. Auth0/Clerk) or JWT-based auth module in NestJS

The backend is a standalone service consumed by:
- Web app (Next.js frontend)
- Future iOS/Android apps (React Native)  

All clients use the same REST + WebSocket APIs.

---

## 2. Project Structure (High-level)

Suggested NestJS structure:

```text
src/
  main.ts
  app.module.ts

  config/
  common/

  auth/
  users/
  households/
  lists/
  products/
  categories/
  supermarkets/
  offers/
  preferences/
  ai/
  realtime/
````

* `config/` – configuration (env, DB connection, etc.)
* `common/` – shared pipes, guards, interceptors, DTOs
* `auth/` – authentication & authorization
* `users/` – user data handling
* `households/` – household + membership logic
* `lists/` – grocery lists and list items
* `products/` – canonical product catalog
* `supermarkets/` – supermarket entities
* `offers/` – offers and “best supermarket” engine
* `preferences/` – learned preferences for household or user
* `ai/` – AI integration (parsing text into items, etc.)
* `realtime/` – WebSocket gateways, rooms, events

Each module uses the standard NestJS structure:

```text
module/
  module-name.module.ts
  module-name.controller.ts
  module-name.service.ts
  dto/
  entities/ (optional, if needed)
```

---

## 3. Prisma & Database

Prisma schema file:

* Location: `prisma/schema.prisma`
* Maps directly to entities defined in `docs/spec.md`.

Core models (initial list):

* `User`
* `Household`
* `HouseholdMember`
* `List`
* `ListItem`
* `Product`
* `Supermarket`
* `Offer`
* `Preference` (user or household, TBD)

> Exact Prisma model definitions will be created in a later step, based on `docs/spec.md`.

---

## 4. Core Modules & Responsibilities

### 4.1 Auth Module (`auth/`)

Handles:

* User signup/login (direct or via external provider).
* JWT issuance & validation OR integration with Auth0/Clerk.

Example endpoints:

* `POST /auth/signup`
* `POST /auth/login`
* `GET /auth/me`

---

### 4.2 Users Module (`users/`)

Exposes user profile data:

* `GET /users/me`
* `PATCH /users/me`

Mostly a thin layer on top of Prisma.

---

### 4.3 Households Module (`households/`)

Responsible for:

* Creating a household.
* Setting household city (for supermarket filtering).
* Adding/removing members (via invite).

Example endpoints:

* `POST /households` – create household.
* `GET /households/me` – get household(s) for current user.
* `POST /households/:id/invite` – generate invite (later).

Enforces:

* Only owner can manage membership.
* Users can only see their own household(s).

---

### 4.4 Lists Module (`lists/`)

Handles:

* CRUD for lists and list items, scoped to household.
* Real-time events for list changes.

Example endpoints:

* `GET /households/:householdId/lists`
* `POST /households/:householdId/lists`
* `GET /lists/:listId`
* `POST /lists/:listId/items`
* `PATCH /lists/:listId/items/:itemId`
* `DELETE /lists/:listId/items/:itemId`

Responsibilities:

- Enforce household scoping for all operations.
- Trigger realtime events (e.g. `list.item.created`) via `realtime/` module.
- When returning a list, include each item’s category (derived from product or directly from list item).
- Sort list items by category.sortOrder (nulls last), then category name, then item name so that items are grouped for easier in-store picking.

---

### 4.5 Products Module (`products/`)

Manages canonical product entries.

Used to map parsed items and offers to known products.

Example endpoints (possibly internal/admin-only at first):

* `GET /products/:id`
* `GET /products?search=milk`
* `POST /products` (admin)

---

### 4.6 Supermarkets Module (`supermarkets/`)

Manages supermarket data:

* `id`, `name`, `city`, coordinates (optional).

Used by offers and recommendation logic.

Example endpoints:

* `GET /supermarkets?city=Riyadh`
* `POST /supermarkets` (admin or ingestion job)

---

### 4.7 Offers Module (`offers/`)

Core responsibilities:

* Ingest offers into DB (via API or background job).
* Provide offer query endpoints (for debugging or admin).
* Implement **“best supermarket for this list”** logic.

Key endpoint:

* `GET /lists/:listId/recommendation`

  * Input: list ID, optional parameters (e.g. max distance, preferences).
  * Output: ranked supermarkets with:

    * total estimated cost
    * estimated discount vs baseline
    * possibly item-level breakdown.

**Important rules (from spec):**

* Only consider supermarkets in household’s city.
* Only use offers where `start_date <= today <= end_date`.
* Normalize sizes to base unit (ml/g) to calculate **price per unit**.
* For each list item:

  * Match relevant offers.
  * Choose the most cost-effective combination (simple first version).
* Compute total basket cost per supermarket.

The detailed algorithm will be specified separately when we implement this module.

---

### 4.8 Preferences Module (`preferences/`)

Tracks historical purchases and preferences.

Responsible for:

* Updating preference data when items are purchased.
* Providing suggestions and default brand/size for new items.

Example internal operations:

* `recordPurchase(userId, productId, supermarketId, quantity, size, date)`
* `getHouseholdSuggestions(householdId)`

---

### 4.9 AI Module (`ai/`)

Responsible for integration with external AI services.

Endpoints:

* `POST /ai/parse-text`

  * Input: raw text (e.g. “2kg chicken for grilling, snacks for kids, 3x 1L milk”).
  * Output: structured items as defined in `docs/spec.md`:

    * name
    * quantity
    * unit
    * notes
    * category
    * brandPreference (optional)

* Later:

  * `POST /ai/parse-voice` – accept audio, call STT, then text parsing.

This module must:

* Keep prompts and expected JSON schema in a clear place (later in `docs/ai.md`).
* Never directly modify DB; instead, parsed items are passed to `lists` module for creation.

---

### 4.10 Realtime Module (`realtime/`)

* Exposes WebSocket gateway(s).

* Manages rooms for households / lists:

  * Example rooms:

    * `household:<householdId>`
    * `list:<listId>`

* Listens to events from other services (lists, offers) and emits:

  * `list:itemCreated`
  * `list:itemUpdated`
  * `list:itemDeleted`

Must enforce:

* Only clients from a household can join corresponding rooms.
* No cross-household data leaks.

---

## 5. Non-Negotiable Backend Constraints

From the spec:

* All list and offer operations must be **scoped to the user’s household**.
* Recommendation endpoints must:

  * Filter by household city.
  * Use only valid offers for the current date.
  * Perform price-per-unit normalization.
* AI endpoints:

  * Must follow the structured output format defined in the spec.
  * Must fail safely (e.g. fallback behavior when AI returns incomplete data).

---

## 6. Implementation Order (Backend)

Suggested order of implementation:

1. **Bootstrap NestJS project + Prisma + PostgreSQL connection**
2. Implement:

   * `User` model + `Auth` module
   * `Households` module (create household, set city)
3. Implement:

   * `Lists` module (CRUD for lists and items)
   * Realtime module for basic list events
4. Implement:

   * `Products`, `Supermarkets`, `Offers` models in Prisma
5. Implement:

   * `Offers` logic for price-per-unit and basket cost
   * `GET /lists/:listId/recommendation`
6. Implement:

   * `AI` module for parsing text into structured items
   * Integration with list creation
7. Implement:

   * `Preferences` module and suggestion logic

This order should be followed unless there is a strong reason to change it.

```

Paste that into `docs/backend-architecture.md`, save, and commit it.

When you’re done, tell me **“Step 3 done”** and we’ll move on to Step 4 (Prisma schema planning).
::contentReference[oaicite:0]{index=0}
```
