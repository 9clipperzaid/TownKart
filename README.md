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

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

## Vercel deployment

Set these Environment Variables in Vercel for Production, Preview, and Development before deploying:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The `VITE_*` values are required at build time for the browser bundle. The non-`VITE_*` values are required at runtime for SSR and server functions.

Build command: `npm run build`

Output directory: `.vercel/output`
