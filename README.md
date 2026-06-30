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
- `FIREBASE_PROJECT_ID` (optional, for order push popups)
- `FIREBASE_CLIENT_EMAIL` (optional, for order push popups)
- `FIREBASE_PRIVATE_KEY` (optional, for order push popups)

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

## Firebase order push popups

Admins can receive browser push popups for new orders through Firebase Cloud Messaging. Add the Firebase service account values to your hosting environment:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

The `FIREBASE_PRIVATE_KEY` value should keep the `\n` newline escapes from the downloaded Firebase service account JSON.

## Vercel deployment

Set these Environment Variables in Vercel for Production, Preview, and Development before deploying:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `FIREBASE_PROJECT_ID` (optional, for order push popups)
- `FIREBASE_CLIENT_EMAIL` (optional, for order push popups)
- `FIREBASE_PRIVATE_KEY` (optional, for order push popups)

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

Build command: `npm run build`

Output directory: `.vercel/output`
