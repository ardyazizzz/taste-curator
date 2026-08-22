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

## Supabase Stage 1 foundation

The repository now includes the first real Supabase layer under `supabase/migrations/`:

- `admin_users`, `clients`, `quizzes`, `quiz_items`, and `responses` tables
- RLS policies for the single-admin V1 model
- narrow `get_public_quiz` and `save_public_response` RPCs for anonymous quiz links
- a public `quiz-references` Storage bucket with authenticated-admin upload policies
- typed browser services in `src/lib/supabase.ts` and `src/services/`

To connect a Supabase project:

1. Create a project in Supabase.
2. Run `supabase/migrations/20260822000000_taste_curator_foundation.sql` in the Supabase SQL Editor.
3. Create the one admin user in Supabase Auth.
4. Add that user to the admin allow-list in the SQL Editor:

   ```sql
   insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
   ```

5. Copy the project URL and publishable key into a local `.env.local` file using `.env.example` as the template.
6. Add the same two `VITE_` variables to Vercel when the UI is wired to the live database.

Only the publishable browser key belongs in `VITE_` variables. Never put a service-role key, secret key, or database password in the frontend or in Git.

## Deployment

Import the repository into Vercel and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. `vercel.json` includes the SPA rewrite needed for `/q/...` style routes.

## Current V1 limitations

The UI still uses one demo quiz and local persistence until Stage 2 wires the existing screens to the new Supabase services. Admin screens, uploads, publishing, and the preference board are still preview-only. AI analysis, teams, billing, and multiple independent respondents remain intentionally out of scope.
