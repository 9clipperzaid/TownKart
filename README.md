# TownKart

## Netlify deployment

This repo includes `netlify.toml` for Netlify builds.

Build command: `npm run build`

Publish directory: `dist`

Node version: `20`

Set these Environment Variables in Netlify before deploying:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `OPENWA_API_URL` (optional, for WhatsApp order alerts)
- `OPENWA_API_KEY` (optional, for WhatsApp order alerts)
- `OPENWA_SESSION_ID` (optional, for WhatsApp order alerts)
- `ORDER_WHATSAPP_PHONE` (optional, owner/admin WhatsApp number with country code)

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

## WhatsApp order alerts with OpenWA

This project can send every new checkout order to your WhatsApp using a self-hosted OpenWA server. Add these server-side environment variables on your hosting provider:

- `OPENWA_API_URL`: OpenWA server URL, for example `http://localhost:2785` or your deployed OpenWA URL
- `OPENWA_API_KEY`: the API key configured in OpenWA
- `OPENWA_SESSION_ID`: the connected OpenWA session id, for example `default`
- `ORDER_WHATSAPP_PHONE`: your WhatsApp number with country code, for example `919999999999`
- `OPENWA_SEND_TEXT_PATH`: optional route override if your OpenWA Swagger shows a different send-text path

The message includes order id/tracking code, store, customer details, item list, totals, payment method, delivery address, and a Google Maps link when the customer shares GPS location at checkout.

If these variables are not set, checkout still works and WhatsApp notifications are skipped.

## Vercel deployment

Set these Environment Variables in Vercel for Production, Preview, and Development before deploying:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `OPENWA_API_URL` (optional, for WhatsApp order alerts)
- `OPENWA_API_KEY` (optional, for WhatsApp order alerts)
- `OPENWA_SESSION_ID` (optional, for WhatsApp order alerts)
- `ORDER_WHATSAPP_PHONE` (optional, owner/admin WhatsApp number with country code)

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

Build command: `npm run build`

Output directory: `.vercel/output`
