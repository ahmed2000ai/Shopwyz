# Shopwyz – AI Coding Workflow

This document tells any AI coding assistant how to work on this project.

The goal is: **do not miss small details from the spec** and **do not invent behavior** that is not defined.

---

## 1. Main Sources of Truth

When working on this project, always use these documents:

1. `docs/spec.md`  
   - Product requirements, entities, flows, and non-negotiable rules.

2. `docs/dev-ai-workflow.md` (this file)  
   - How the AI should behave while coding.

In any coding session, the AI must **read or be given the relevant parts** of `docs/spec.md` before implementing or changing features.

---

## 2. General Rules for the AI Agent

When you (the AI) are asked to write or modify code in this repo:

1. **Never ignore the spec**
   - Treat `docs/spec.md` as the law.
   - If the request conflicts with the spec, call it out and propose options.

2. **Don’t invent features**
   - If something is not defined in the spec:
     - Ask for clarification **or**
     - Clearly propose options and wait for confirmation before implementing.

3. **Respect non-negotiable rules**
   - These are listed in `docs/spec.md` under “Non-Negotiable Rules”.
   - You must explicitly check that your code respects them.

4. **Prefer small, focused changes**
   - Implement one feature or sub-feature at a time.
   - Avoid changing many unrelated modules in a single step.

---

## 3. Checklist-Driven Development

For each feature or task:

1. **Start from a checklist**
   - Use the relevant checklist from `docs/spec.md` under “Feature Checklists”.
   - If it is not detailed enough, expand it into sub-items.

2. **Before coding, restate the checklist**
   - Example:

     > “I am going to implement:  
     >  - [ ] Create household  
     >  - [ ] Set city  
     >  - [ ] Ensure authorization: only members can access the household”

3. **After coding, update the checklist**
   - Mark items that are fully implemented.
   - If anything is partially done or skipped, explicitly say so in a “Limitations” section.

Example:

> **Checklist status:**  
> - [x] Create household  
> - [x] Set city  
> - [ ] Authorization checks (NOT implemented yet)

---

## 4. Tests Before Implementation

For any non-trivial logic (e.g. offers, best supermarket, AI parsing), follow this order:

1. **From the spec, derive test cases first.**
   - Unit tests / integration tests that reflect the rules.

2. **Then implement the code to satisfy the tests.**

3. **Then run through edge cases from the spec:**
   - Different item sizes
   - Supermarket in another city
   - No valid offers
   - Empty lists, etc.

If you add or change logic but do **not** update tests, you must say so in the “Limitations” section.

---

## 5. Spec Audit Mode

On request, you (the AI) may be asked to do a **spec audit**:

1. Compare the behavior defined in `docs/spec.md` with the current code.
2. List any spec items that:
   - Are not implemented
   - Are only partially implemented
   - Are implemented differently than described

Output format:

- **Implemented as specified**
  - Item 1…
- **Partially implemented**
  - Item 2 (explain what’s missing)
- **Not implemented**
  - Item 3…

The audit should never assume things; it must be based only on the code and the spec text provided.

---

## 6. Non-Negotiable Rules (Short Version)

When working on code that touches offers, supermarkets, lists, or AI:

- Only recommend supermarkets that exist in the user’s **city**.
- Only use offers that are valid in time (`start_date <= today <= end_date`).
- Always normalize sizes and compare by **price per base unit (ml/g)**.
- AI parsing should return quantity + unit whenever possible.
- Users cannot see data from other households.
- Real-time events must not mix data between households.

If any of these rules are not satisfied by the resulting code, the AI must explicitly mention it.

---

## 7. Commit Messages

When the AI suggests changes, it should also propose a clear commit message, for example:

- `feat(lists): add CRUD endpoints for household lists`
- `feat(offers): compute basket cost with unit normalization`
- `test(offers): add unit tests for best supermarket selection`
- `fix(auth): enforce household scoping on list queries`

The commit message should reflect **one logical change**.

---

## 8. When Context Is Limited

If the AI cannot see the full spec or full codebase because of context limits:

1. It must say so explicitly.
2. It should ask to be provided with:
   - The relevant section of `docs/spec.md`
   - The specific files it needs to work with
3. It must avoid making assumptions about unseen logic.

---

This workflow exists to make sure AI-generated code for Shopwyz is:
- Aligned with the product spec.
- Testable.
- Transparent about what is missing or incomplete.
