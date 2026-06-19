# Kazba Marketplace Production Upgrade

## What Was Added

- Supabase migration for vendor, delivery partner, address, coupon, review, wishlist, favorite store, support settings, and hardened order fields.
- RLS policies for customer-owned data, store-owner access, delivery-partner assignments, and admin management.
- Secure server checkout via `secureCheckout`, replacing direct browser-side order creation.
- Admin order board at `/admin/orders` for live fulfillment status changes.
- Admin support settings at `/admin/settings`, used by floating Call, WhatsApp, and Email buttons.
- Vendor dashboard at `/vendor`.
- Delivery partner dashboard at `/delivery`.
- Home page store tiles updated toward a Blinkit/Zepto-style responsive marketplace layout.
- Server response security headers in `src/server.ts`.

## Security Notes

Kazba currently uses Supabase Auth for JWT sessions and refresh-token handling. Password hashing is handled by Supabase Auth infrastructure. App-owned OTP codes are hashed before storage and rate-limited per phone number.

Important production checks:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Rotate keys if `.env` has ever been shared publicly.
- Regenerate Supabase TypeScript types after applying migrations.
- Apply the new migration before deploying the UI.
- Configure payment verification on a server function only; never trust client payment status.

## New Tables

- `addresses`
- `delivery_partners`
- `coupons`
- `reviews`
- `favorite_stores`
- `wishlist_items`
- `marketplace_settings`

## New/Extended Order Flow

Statuses supported by the operational board:

- `pending`
- `accepted`
- `preparing`
- `out_for_delivery`
- `delivered`
- `cancelled`

The checkout server function:

- validates delivery address with Zod
- reloads cart and product prices server-side
- checks stock availability
- checks store active status
- checks store minimum order
- calculates subtotal, delivery fee and total server-side
- applies an idempotency key to prevent duplicate orders
- decrements product stock
- creates customer notifications
- clears the cart only after order creation succeeds

## Follow-Up Deployment Steps

1. Run Supabase migrations.
2. Regenerate Supabase types.
3. Install project dependencies with Bun or npm in your normal environment.
4. Run the app build.
5. Test login, checkout, admin order status updates, vendor dashboard, delivery dashboard, and support settings.
