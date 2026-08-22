# Taste Curator

A playful visual preference quiz for client discovery. The current prototype is a Vite + React + TypeScript experience with a polished client preview and a lightweight admin workspace.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. The client preview is at `/`; the admin preview is at `/admin`.

## Build

```bash
npm run build
```

## Supabase handoff

`.env.example` documents the intended browser-safe Supabase variables. The demo keeps answers in local storage so the interaction can be previewed without credentials; the service boundary is intentionally kept simple for wiring to Supabase RPCs in the next pass. Never put a service-role key in a `VITE_` variable.

## Deployment

Import the repository into Vercel and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. `vercel.json` includes the SPA rewrite needed for `/q/...` style routes.

## V1 limitations

This is a front-end prototype with one demo quiz and local persistence. It includes the client interaction, responsive polish, zoom, keyboard shortcuts, progress, undo, completion payoff, and an admin preview board. Auth, uploads, RLS, and Supabase migrations are the next integration layer.
