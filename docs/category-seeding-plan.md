# Shopwyz – Category Seeding Plan

## 1. Goal

Seed the `Category` table with a clean, hierarchical taxonomy similar to Carrefour’s:

- Top-level categories (e.g. Fresh Food, Food Cupboard, Beverages, Frozen Food…)
- Subcategories under each (e.g. Food Cupboard → “Biscuits, Crackers & Cakes”)
- A `sortOrder` that follows the typical in-store walking flow.

This taxonomy will be used to:

- Group list items in the UI.
- Help AI classify items (via `categoryName`).
- Ensure products and list items always map to a consistent category set.

---

## 2. Data Shape

Each category seed entry should include:

- `name`: string (e.g. "Fresh Food", "Biscuits, Crackers & Cakes")
- `parentName`: string or null (null for top-level)
- `sortOrder`: integer (lower = shown earlier)
- (Optional) `slug`: string, if we later want stable identifiers

Example (conceptual):

- `Fresh Food` (parent: null, sortOrder: 10)
  - `Fruits & Vegetables` (parent: Fresh Food, sortOrder: 11)
  - `Meat & Poultry` (parent: Fresh Food, sortOrder: 12)
  - `Dairy & Eggs` (parent: Fresh Food, sortOrder: 13)

---

## 3. Storage Format for Seed Data

We will store the taxonomy in a simple static file so it’s easy to edit:

- Option A (recommended): `prisma/seeds/categories.json`
- Option B: `prisma/seeds/categories.ts` (exporting an array of objects)

Example JSON structure:

```json
[
  { "name": "Fresh Food", "parentName": null, "sortOrder": 10 },
  { "name": "Fruits & Vegetables", "parentName": "Fresh Food", "sortOrder": 11 },
  { "name": "Meat & Poultry", "parentName": "Fresh Food", "sortOrder": 12 },
  { "name": "Dairy & Eggs", "parentName": "Fresh Food", "sortOrder": 13 }
]
