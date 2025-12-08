# Frontend AI Development Workflow (Shopwyz)

The AI agent is ONLY allowed to modify files inside `/frontend`.

The agent must NEVER:
- read or modify files in `/backend`
- read or modify files in `/prisma`
- read or modify files in `/docs` at the project root
- generate backend code or migrate backend structures

The AI agent may ONLY reference backend behavior by:
- reading API endpoints exposed through the backend (no internal backend code)
- using the documented API contracts in `/frontend/docs/frontend-architecture.md`

The AI agent MUST follow these rules:

## 1. Allowed Work Area
- The agent may ONLY read or modify files inside `/frontend`.
- The agent must NEVER modify anything inside `/backend`, `/prisma`, or `/docs` (root-level docs).

## 2. Source of Truth (Frontend)
When implementing any frontend feature, the agent must use these files:

- `/frontend/docs/frontend-architecture.md`
- `/frontend/docs/frontend-feature-checklists.md`

Backend behavior must be inferred ONLY by reading:
- The public API endpoints that the frontend calls (no internal backend files).

## 3. Required Steps for Each Feature
Before coding:
1. Identify the relevant checklist section from `frontend-feature-checklists.md`
2. Paste the checklist into the conversation
3. Propose a short implementation plan (5–7 steps)

While coding:
- Modify files ONLY under `/frontend`
- Use `src/app/**` for routes
- Use `src/components/**` for reusable UI
- Use `src/lib/**` for API helpers

After coding:
1. Update the checklist with ✔ / ✖ / ~
2. Provide a commit message
3. WAIT for confirmation before generating more code

## 4. Auth Requirements
- Always use JWT token stored in `localStorage` under `shopwyz_token`
- Always include the token in `Authorization: Bearer <token>`

## 5. Error Handling Guidelines
- Show user-friendly messages
- Do not crash routes on missing token — redirect to `/login`

---

## 6. Example Frontend Session Prompt – Auth UI (Login)

When starting a new frontend coding session for Shopwyz, you can use this prompt as a template.

> You are helping me implement the Shopwyz frontend in `/frontend`.
>
> HARD LIMITS (read this carefully):
> - You may ONLY read and modify files inside `/frontend`.
> - You must NEVER read or modify anything in:
>   - `/backend`
>   - `/prisma`
>   - `/docs` at the project root
> - All backend behavior must be treated as a black box, accessed only via HTTP calls from the frontend.
>
> Authoritative frontend docs (source of truth):
> - `/frontend/docs/frontend-architecture.md`
> - `/frontend/docs/frontend-feature-checklists.md`
> - `/frontend/docs/dev-ai-frontend-workflow.md`
>
> For this session, our goal is:
> - Implement the **Auth UI – Login Page** as described in `frontend-feature-checklists.md`.
>
> Steps you must follow:
> 1. Locate the **"1. Auth UI – Login Page"** checklist in `/frontend/docs/frontend-feature-checklists.md` and paste it here.
> 2. Propose a short, 5–7 step implementation plan.
> 3. Implement the feature by modifying ONLY files under:
>    - `/frontend/src/app/**`
>    - `/frontend/src/lib/**`
>    - `/frontend/src/components/**` (if needed)
> 4. Use `NEXT_PUBLIC_API_BASE_URL` for backend API calls.
> 5. For auth:
>    - Call `POST /auth/login` on the backend.
>    - On success, store the JWT in `localStorage` as `shopwyz_token`.
> 6. After coding:
>    - Update the checklist with ✔ / ✖ / ~.
>    - Show me the list of files you changed.
>    - Suggest a commit message (for example: `feat(frontend): add login page and basic dashboard redirect`).
>
> Do NOT:
> - Change any files outside `/frontend`.
> - Invent new backend endpoints; use only what exists.

---