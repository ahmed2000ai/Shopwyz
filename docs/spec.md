# Smart Grocery App – Product Spec (Shopwyz)

## 1. Vision

Shopwyz is a shared household grocery app that:
- Lets multiple users in a household collaboratively manage grocery lists.
- Accepts natural language (text/voice) input and converts it into structured items.
- Learns household preferences over time (brands, sizes, frequency).
- Uses supermarket offers data to recommend the best supermarket in the user’s city, considering different package sizes and price per unit.

---

## 2. Core Concepts

- **User**: A person with an account.
- **Household**: A group of users sharing lists, location, and preferences.
- **List**: A grocery list (e.g. “Weekly”, “BBQ Party”).
- **List Item**: A structured item in a list (e.g. “2x 1L whole milk”).
- **Category**: Hierarchical product categories (e.g. Fresh Food → Fruits & Vegetables → Fruits) used to group products and list items so shoppers can pick items more efficiently in-store.
- **Product**: Canonical representation (brand, category, base size).
- **Supermarket**: Store with location (city).
- **Offer**: Time-bound promotion on a product.
- **Preferences**: Learned behavior (brands, sizes, frequency).

---

## 3. User Roles & Flows

### 3.1 Roles

- **Household Owner**
  - Creates household.
  - Invites/removes members.

- **Household Member**
  - Joins an existing household.
  - Edits/uses shared lists.

---

### 3.2 High-level Flows

#### 1. User Onboarding
- Sign up/in.
- Create a household OR join via invite.
- Set city (used for filtering supermarkets).

#### 2. List Management
- Create/delete lists.
- Add/edit/delete items.
- Check/uncheck purchased items.
- Real-time sync with household members.
  
  **Category-based grouping**

- Each list item is associated with a category, either via its linked product or directly.
- When displaying a list, items should be grouped by category and ordered by the category’s `sortOrder` (e.g. following typical store layout).
- Uncategorized items (no category found) are shown in an “Other” or equivalent section.


#### 3. AI Input
- User types or speaks natural language.
- AI converts it to structured items:
  - name  
  - quantity  
  - unit  
  - notes  
  - category  
  - brand preference (optional)

#### 4. Offers & Supermarket Recommendation
- Filter supermarkets by city.
- For each item:
  - Find valid offers (date and city).
  - Normalize size (to ml/g).
  - Compare price per unit.
- Calculate basket cost for each supermarket.
- Recommend the best one with:
  - total estimated cost  
  - total discount  

#### 5. Preference Learning
- Track purchased products.
- Learn frequency.
- Suggest recurring items.
- Auto-fill size/brand next time.

---

## 4. Non-Negotiable Rules

- Recommend only supermarkets in the user's **city**.
- Use only **valid offers** (`start_date <= today <= end_date`).
- Always compare by **price per base unit (ml/g)**.
- AI must return **quantity + unit** whenever possible.
- Users only access data from their own household.
- Real-time events must never leak across households.

---

## 5. Entities (Initial Draft)

### 5.1 User
- id  
- name  
- email  
- password_hash / OAuth ID  
- created_at  

### 5.2 Household
- id  
- name  
- city  
- country (optional)  
- created_at  

### 5.3 HouseholdMember
- id  
- household_id  
- user_id  
- role  
- created_at  

### 5.4 List
- id  
- household_id  
- name  
- created_at  
- updated_at  

### 5.5 ListItem
- id  
- list_id  
- product_id (nullable)  
- name  
- quantity  
- unit  
- notes  
- is_checked  
- created_by_user_id  
- created_at  

### 5.6 Product
- id  
- name  
- brand  
- category  
- size_value  
- size_unit  
- base_unit  
- base_unit_per_item  

### 5.7 Supermarket
- id  
- name  
- city  
- latitude (optional)  
- longitude (optional)  

### 5.8 Offer
- id  
- supermarket_id  
- product_id  
- offer_price  
- original_price  
- currency  
- size_value  
- size_unit  
- start_date  
- end_date  

### 5.9 Preferences
- id  
- household_id (or user_id)  
- product_id  
- preferred_brand  
- preferred_size_value  
- preferred_size_unit  
- frequency_days  
- last_purchased_at  

---

## 6. AI Responsibilities (High-Level)

### 6.1 Parsing
Input:
- Free text (later: audio → text)

Output:
- JSON array of items:
  - name  
  - quantity  
  - unit  
  - notes  
  - category  
  - optional brand preference  

### 6.2 Learning
- Analyze purchase history.
- Infer frequency and preferences.
- Suggest recurring items.

---

## 7. Feature Checklists (To Be Expanded)

### 7.1 Households & Auth
- [ ] User signup/login  
- [ ] Create household, set city  
- [ ] Invite members  
- [ ] Authorization restrictions  

### 7.2 Lists & Items
- [ ] CRUD lists  
- [ ] CRUD items  
- [ ] Real-time updates  
- [ ] Validation  

### 7.3 AI Input
- [ ] AI parse endpoint  
- [ ] AI list creation integration  
- [ ] AI error handling  

### 7.4 Offers & Recommendation
- [ ] Offer ingestion  
- [ ] Size normalization  
- [ ] Basket cost computation  
- [ ] Best supermarket endpoint  

### 7.5 Preferences
- [ ] Track purchased items  
- [ ] Compute frequency  
- [ ] Suggest recurring items  
- [ ] Auto-fill brand/size  
