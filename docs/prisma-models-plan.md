# Shopwyz – Prisma Models Plan

This document defines the planned Prisma models before implementation.  
They are derived from `docs/spec.md` and `docs/backend-architecture.md`.

The next step after this will be generating the actual `schema.prisma` file.

---

# 1. User Model

### Purpose
Represents a user account in the system.

### Fields
- id (string, uuid, @id)
- name (string)
- email (string, unique)
- passwordHash (string) or externalAuthId (string, optional)
- createdAt (DateTime, default now)

### Relations
- households (via HouseholdMembers)
- createdListItems (reverse relation for items created by the user)

---

# 2. Household Model

### Purpose
Represents a logical home unit containing users, lists, preferences, and location data.

### Fields
- id (string, uuid, @id)
- name (string)
- city (string)
- country (string, optional)
- createdAt (DateTime, default now)

### Relations
- members: HouseholdMember[]
- lists: List[]
- preferences: Preference[]

---

# 3. HouseholdMember Model

### Purpose
Links users to households with a role.

### Fields
- id (string, uuid, @id)
- userId (string, references User.id)
- householdId (string, references Household.id)
- role (enum: OWNER, MEMBER)
- createdAt (DateTime, default now)

### Relations
- user: User
- household: Household

### Constraints
- Unique (userId, householdId)

---

# 4. List Model

### Purpose
Represents a grocery list associated with a household.

### Fields
- id (string, uuid, @id)
- householdId (string)
- name (string)
- createdAt (DateTime, default now)
- updatedAt (DateTime, updatedAt)

### Relations
- household: Household
- items: ListItem[]

---

# 5. Category Model (NEW)

### Purpose
Represents hierarchical product categories (like Carrefour’s taxonomy) for grouping products and list items.

### Fields
- id (string, uuid, @id)
- name (string)
- parentId (string, optional)
- sortOrder (int, default 0)
- createdAt (DateTime, default now)

### Relations
- parent: Category (optional)
- children: Category[]
- products: Product[]
- listItems: ListItem[]

### Notes
- Supports multiple levels (Fresh Food → Fruits & Vegetables → Fruits).
- `sortOrder` defines in-store walking order.

---

# 6. ListItem Model

### Purpose
An item on a grocery list, optionally linked to a product and category.

### Fields
- id (string, uuid, @id)
- listId (string)
- productId (string, optional)
- categoryId (string, optional) — NEW
- name (string) — user visible label
- quantity (float)
- unit (enum: KG, G, L, ML, PCS, PACK)
- notes (string, optional)
- isChecked (boolean, default false)
- createdByUserId (string)
- createdAt (DateTime, default now)

### Relations
- list: List
- product: Product (optional)
- category: Category (optional) — NEW
- createdByUser: User

### Notes
- If a product is known, list item inherits its category automatically.

---

# 7. Product Model

### Purpose
Canonical product representation for mapping items, offers, and category grouping.

### Fields
- id (string, uuid, @id)
- name (string)
- brand (string)
- categoryId (string) — NEW (replaces old category string)
- sizeValue (float)
- sizeUnit (enum: KG, G, L, ML)
- baseUnit (enum: ML, G)
- baseUnitPerItem (float)
- createdAt (DateTime)

### Relations
- category: Category — NEW
- listItems: ListItem[]
- offers: Offer[]
- preferences: Preference[]

### Notes
- baseUnitPerItem = sizeValue normalized (e.g., 1L → 1000ml)
- Used for price-per-unit comparison.

---

# 8. Supermarket Model

### Purpose
Represents supermarkets by city.

### Fields
- id (string, uuid, @id)
- name (string)
- city (string)
- latitude (float, optional)
- longitude (float, optional)
- createdAt (DateTime, default now)

### Relations
- offers: Offer[]

---

# 9. Offer Model

### Purpose
Represents time-bound supermarket promotions.

### Fields
- id (string, uuid, @id)
- supermarketId (string)
- productId (string)
- offerPrice (float)
- originalPrice (float)
- currency (string)
- sizeValue (float)
- sizeUnit (enum: KG, G, L, ML)
- startDate (DateTime)
- endDate (DateTime)
- createdAt (DateTime, default now)

### Relations
- supermarket: Supermarket
- product: Product

### Notes
- Must normalize sizeValue/sizeUnit to baseUnit for comparisons.

---

# 10. Preference Model

### Purpose
Tracks household-level buying patterns and preferences.

### Fields
- id (string, uuid, @id)
- householdId (string)
- productId (string)
- preferredBrand (string, optional)
- preferredSizeValue (float, optional)
- preferredSizeUnit (enum: KG, G, L, ML, optional)
- frequencyDays (int, optional)
- lastPurchasedAt (DateTime, optional)

### Relations
- household: Household
- product: Product

---

# 11. Enums

### Role
- OWNER
- MEMBER

### Units
- KG
- G
- L
- ML
- PCS
- PACK

### BaseUnit
- ML
- G

---

# 12. Next Steps

After this plan is approved:

- Ensure `schema.prisma` matches this design.
- Run `npx prisma migrate dev` to update the database.
- Begin implementing backend modules following `backend-architecture.md`.
