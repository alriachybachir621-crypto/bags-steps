# Security Specification — Bags&Steps

## 1. Data Invariants
1. **Catalog & Shop Collections (`/products`, `/categories`, `/shop`, `/lookbook`)**:
   - Publicly readable (`allow read: if true`) so storefront visitors can browse products, categories, hero imagery, lookbook, and delivery/contact info without authentication.
   - Contain **zero PII** (no customer orders, customer phone numbers, or customer addresses are persisted in Firestore; orders go directly to WhatsApp).
   - Writable (`create`, `update`, `delete`) **strictly** when `request.auth != null && request.auth.token.email == "admin@bagsandsteps.app"`.
2. **Path & Payload Bounds**:
   - All document IDs must satisfy `^[a-zA-Z0-9_-]+$` and length `<= 128`.
   - All strings have explicit `.size()` upper bounds matching `firebase-blueprint.json`.
   - All arrays (`sizes`, `colors`, `images`, `heroImages`) have explicit `.size() <= MAX` bounds.
   - `keys().hasAll(...)` and `keys().hasOnly(...)` prevent shadow/ghost fields on `create` and `update`.
3. **Storage Rules (`storage.rules`)**:
   - Public read (`allow read: if true`).
   - Write restricted strictly to `request.auth != null && request.auth.token.email == "admin@bagsandsteps.app"` with image content-type and size checks (`<= 10MB`).

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `create` on `/products/prod1`
2. Authenticated non-admin (`user@example.com`) `create` on `/products/prod1`
3. Unauthenticated `update` on `/shop/main`
4. Non-admin `delete` on `/categories/shoes`
5. Admin `create` on `/products/prod1` with a ghost/shadow field `{ isAdmin: true }`
6. Admin `create` on `/products/bad$id!` with invalid path ID characters
7. Admin `create` on `/products/prod1` with oversized `name` (> 120 chars)
8. Admin `create` on `/products/prod1` with negative `price`
9. Admin `create` on `/products/prod1` with invalid category `'electronics'`
10. Admin `create` on `/products/prod1` with > 8 images (array exhaustion)
11. Unauthenticated write to unknown collection `/secret/doc1` (caught by default-deny)
12. Non-admin `update` on `/lookbook/item1`
