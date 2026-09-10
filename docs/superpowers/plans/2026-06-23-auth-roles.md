# Login And Role Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete login loop for travelers and admins without disrupting the existing Hangzhou tourism UI.

**Architecture:** Keep one `user_accounts` table with `role`, `status`, `avatar_color`, and salted password hashes. Vue restores a bearer token, shows login/avatar UI, and guards traveler/admin routes; the Node API enforces the same role rules for real security.

**Tech Stack:** Vue 3, Vue Router, Pinia refs, Node HTTP server, `node:sqlite`, Node `crypto.scryptSync`, shell-free Node smoke tests.

---

### Task 1: Backend Auth And Data Ownership

**Files:**
- Modify: `server/database.mjs`
- Modify: `server/index.mjs`
- Modify: `server/seed.mjs`
- Modify: `database/schema.sql`
- Create: `test/auth-flow.mjs`
- Modify: `package.json`

- [ ] Add smoke tests for login, admin-only APIs, traveler order ownership, and registration.
- [ ] Run `npm run test:auth` and confirm it fails before the guards are implemented.
- [ ] Add salted `scrypt` password helpers with legacy hash compatibility.
- [ ] Add `user_id` and `avatar_color` persistence in SQLite and MySQL schema.
- [ ] Require admins for management endpoints and require login for traveler order endpoints.
- [ ] Run `npm run test:auth` and confirm it passes.

### Task 2: Frontend Session, Entry Points, And Route Guards

**Files:**
- Modify: `src/App.vue`
- Modify: `src/main.ts`
- Modify: `src/router/index.ts`
- Modify: `src/components/layout/SiteHeader.vue`
- Modify: `src/components/layout/LoginModal.vue`
- Modify: `src/components/layout/UserMenu.vue`
- Modify: `src/stores/auth.ts`
- Modify: `src/stores/catalog.ts`
- Modify: `src/pages/Booking.vue`
- Modify: `src/pages/Orders.vue`
- Modify: `src/pages/Admin.vue`

- [ ] Restore auth before mounting and show the login modal globally.
- [ ] Add desktop and mobile login/avatar controls matching the current header style.
- [ ] Guard `/booking`, `/orders`, and `/admin`; redirect unauthorized users without blanking the page.
- [ ] Make booking prefill visitor fields from the logged-in account where appropriate.
- [ ] Keep admin data loading resilient when normal visitors cannot fetch admin-only data.
- [ ] Run `npm run build` and fix TypeScript or layout regressions.

### Task 3: Verification

**Files:**
- Inspect: changed files and rendered app.

- [ ] Run `npm run test:auth`.
- [ ] Run `npm run build`.
- [ ] Start the app with `npm run dev:full` if needed and verify login, registration, traveler orders, admin access, and logout in browser.
