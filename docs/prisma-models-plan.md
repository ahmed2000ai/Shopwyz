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

### Notes
- Optionally support OAuth (Auth0/Clerk) using externalAuthId.

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

# 5. ListItem Model

### Purpose
An item on a grocery list.

### Fields
- id (string, uuid, @id)
- listId (string)
- productId (string, optional)
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
- createdByUser: User

---

# 6. Product Model

### Purpose
Canonical product representation for mapping items and offers.

### Fields
- id (string, uuid, @id)
- name (string)
- brand (string)
- category (string)
- sizeValue (float)
- sizeUnit (enum: KG, G, L, ML)
- baseUnit (enum: ML, G)
- baseUnitPerItem (float)
- createdAt (DateTime)

### Notes
- baseUnitPerItem = sizeValue converted to smallest unit (e.g. 1L → 1000ml)
- Used for price-per-unit comparisons.

---

# 7. Supermarket Model

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

# 8. Offer Model

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

# 9. Preference Model

### Purpose
Tracks household or user preferences over time.

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

### Notes
- We will determine later whether this should also support user-specific preferences.

---

# 10. Enums

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

# 11. Next Steps

After this plan is approved:

- Convert it into `prisma/schema.prisma`.
- Run `npx prisma migrate dev` to create the database.
- Start implementing modules in the order from `backend-architecture.md`.
