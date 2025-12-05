# Shopwyz – Feature Checklists

This file expands the high-level feature lists from `docs/spec.md` into strict, detailed checklists.

AI coding assistants must use these checklists before writing or modifying code.

Each feature checklist:

- Must be restated by the AI before coding.
- Must be updated after coding (mark ✔, ✖, or partial).
- Must include tests when appropriate.

---

# 1. Household & Auth Features

## 1.1 User Signup / Login
- [ ] Accept name, email, password (or externalAuthId).
- [ ] Validate email is unique.
- [ ] Hash password (if using local auth).
- [ ] Return JWT or session token.
- [ ] Implement `GET /auth/me`.
- [ ] Reject incorrect login attempts securely.
- [ ] Add rate limiting / brute force protection (later).

## 1.2 Create Household
- [ ] Require authenticated user.
- [ ] Accept name & city (city required).
- [ ] Create household record.
- [ ] Add user as `OWNER` in HouseholdMember.
- [ ] Return household info to the client.
- [ ] Enforce user can belong to multiple households? (Decide later.)

## 1.3 Join Household via Invite
- [ ] Generate unique invite token.
- [ ] Token encodes householdId securely.
- [ ] Validate token not expired.
- [ ] Add user to household with `MEMBER` role.
- [ ] Prevent duplicate membership.
- [ ] Return updated household.

---

# 2. Lists & Items

## 2.1 List CRUD
- [ ] Create list (requires householdId).
- [ ] List belongs to the household.
- [ ] Only household members can see lists.
- [ ] Only household members can create lists.
- [ ] Fetch all lists for a household.
- [ ] Update list name.
- [ ] Delete list (soft delete? TBD).
- [ ] Emit realtime events:
  - [ ] `list.created`
  - [ ] `list.updated`
  - [ ] `list.deleted`
- [ ] When returning a list, include each item's category (if any).
- [ ] Sort items by category.sortOrder (category without sortOrder or null go last), then item name.


## 2.2 List Item CRUD
- [ ] Create list item.
  - [ ] Validate quantity > 0.
  - [ ] Validate unit is a valid enum.
  - [ ] Link to productId if known.
  - [ ] Set createdByUserId.
- [ ] Update item fields (quantity, note, name, …).
- [ ] Toggle isChecked.
- [ ] Delete item.
- [ ] Emit realtime events:
  - [ ] `list.item.created`
  - [ ] `list.item.updated`
  - [ ] `list.item.checked`
  - [ ] `list.item.deleted`
- [ ] Ensure item operations are scoped to household.

---

# 3. AI Input Features

## 3.1 Parse Free Text
- [ ] Endpoint: `POST /ai/parse-text`.
- [ ] Receive `text: string`.
- [ ] Use LLM to extract:
  - [ ] name
  - [ ] quantity
  - [ ] unit
  - [ ] notes
  - [ ] category
  - [ ] brandPreference (optional)
- [ ] Attempt to assign a category to each parsed item based on the known category taxonomy.
- [ ] Validate the returned JSON adheres to schema.
- [ ] Return list of parsed items.
- [ ] Add error fallback:
  - [ ] If AI returns incomplete data → return partial + warnings.
  - [ ] If AI fails → return “parse failed” error.

## 3.2 Integration with List Item Creation
- [ ] After parsing → call ListsService to create items.
- [ ] Ensure items are linked to the correct list.
- [ ] Use preferences to auto-fill missing brand/size if possible.
- [ ] Return updated list with new items.

---

# 4. Products & Supermarkets

## 4.1 Product Management
- [ ] Create product (admin).
- [ ] Search products (text search).
- [ ] Ensure sizeValue/unit → calculate baseUnitPerItem.
- [ ] Prevent product duplicates? (TBD)

## 4.2 Supermarket Management
- [ ] Create supermarket (admin).
- [ ] List supermarkets by city.
- [ ] Validate city exists.
- [ ] Ensure coordinates optional.

---

# 5. Offers & Recommendation Engine

## 5.1 Offer Ingestion
- [ ] Insert offer with:
  - [ ] supermarketId
  - [ ] productId
  - [ ] offerPrice
  - [ ] originalPrice
  - [ ] sizeValue
  - [ ] sizeUnit
  - [ ] startDate
  - [ ] endDate
- [ ] Validate effective dates.
- [ ] Avoid overlapping duplicates? (TBD)

## 5.2 Best Supermarket Algorithm
For a given `listId`:

- [ ] Resolve household from list → get household.city.
- [ ] Filter supermarkets by household.city.
- [ ] For each supermarket:
  - [ ] For each list item:
    - [ ] Normalize offer sizes to baseUnit (e.g., ML, G).
    - [ ] Compare price per unit.
    - [ ] Choose cheapest offer or fallback baseline.
  - [ ] Sum estimated total cost.
  - [ ] Sum estimated discount.
- [ ] Return sorted list:
  - [ ] supermarketId
  - [ ] totalCost
  - [ ] totalDiscount
  - [ ] item-level breakdown
- [ ] Handle edge cases:
  - [ ] No offers available → fallback to baseline.
  - [ ] No supermarket in user’s city → return empty list.
  - [ ] Invalid list → return 404.

---

# 6. Preferences & Learning

## 6.1 Track Purchases
- [ ] When item marked as checked → treat as “purchased.”
- [ ] Update preference record:
  - [ ] lastPurchasedAt
  - [ ] frequencyDays (rolling average)
  - [ ] preferredBrand
  - [ ] preferredSizeValue
  - [ ] preferredSizeUnit
- [ ] Ensure each household+product pair is unique.

## 6.2 Suggest Recurring Items
- [ ] Identify items overdue (today - lastPurchasedAt > frequencyDays).
- [ ] Return suggestions in endpoint: `GET /households/:id/suggestions`.

## 6.3 Auto-fill Preferences
- [ ] When adding items:
  - [ ] If name matches past product:
    - [ ] Fill brand/size automatically.
- [ ] Allow override by user.

---

# 7. Realtime (WebSockets)

## 7.1 Join Rooms
- [ ] Require valid JWT/session.
- [ ] Verify user belongs to household.
- [ ] Join:
  - [ ] `household:<householdId>`
  - [ ] (also) `list:<listId>` when viewing/editing a list.

## 7.2 Emit Events
- [ ] list.created
- [ ] list.updated
- [ ] list.deleted
- [ ] list.item.created
- [ ] list.item.updated
- [ ] list.item.deleted
- [ ] list.item.checked

## 7.3 Security
- [ ] Prevent cross-household leaks.
- [ ] Disconnect on unauthorized access.
- [ ] Validate listId belongs to household.

---

# 8. Testing Requirements

## 8.1 Unit Tests
- [ ] Offer normalization (size to base unit)
- [ ] Price-per-unit calculation
- [ ] Basket cost aggregation
- [ ] Preference frequency calculation
- [ ] AI JSON validator

## 8.2 Integration Tests
- [ ] Household scoping
- [ ] List CRUD
- [ ] List item CRUD
- [ ] Realtime events firing
- [ ] Best supermarket endpoint

## 8.3 AI Tests
- [ ] Validate LLM returns required fields.
- [ ] Test fallback behavior.
- [ ] Test parsing edge cases.

---

# 9. Categories (Taxonomy)

- [ ] Seed the Category table with the full hierarchy (top-level + subcategories + sortOrder).
- [ ] Ensure every Product has a valid categoryId.
- [ ] Ensure ListItem inherits the product’s categoryId when productId is set.
- [ ] When AI parsing assigns a category, map it to an existing Category record.
- [ ] Uncategorized items should fall back to a default “Other” group.
- [ ] List retrieval must return category info.
- [ ] List items must be sorted by:
  - [ ] category.sortOrder (ascending, nulls last)
  - [ ] category.name
  - [ ] item.name

---

# Usage Instructions for AI Assistants

Before implementing or modifying any feature:

1. Locate the relevant feature checklist.
2. Copy it into the coding session.
3. Restate it before coding.
4. Update the checklist after coding:
   - Mark ✔ completed
   - Mark ✖ not implemented
   - Mark ~ partial
5. Ask for confirmation before skipping any item.
6. Add or update tests where required.
