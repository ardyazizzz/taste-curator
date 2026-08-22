-- Taste Curator Stage 1 foundation.
-- Apply this migration to a Supabase project before adding VITE_SUPABASE_* values.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  slug text not null check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  intro_text text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  access_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (client_id, slug)
);

create table if not exists public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position integer not null check (position >= 0),
  image_path text not null check (char_length(trim(image_path)) > 0),
  prompt text,
  created_at timestamptz not null default now(),
  unique (quiz_id, position)
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  quiz_item_id uuid not null references public.quiz_items(id) on delete cascade,
  rating text not null check (rating in ('not_for_me', 'kinda_like', 'love_it')),
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quiz_item_id)
);

create index if not exists quizzes_client_id_idx on public.quizzes(client_id);
create index if not exists quiz_items_quiz_id_position_idx on public.quiz_items(quiz_id, position);
create index if not exists responses_quiz_id_idx on public.responses(quiz_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists quizzes_set_updated_at on public.quizzes;
create trigger quizzes_set_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

drop trigger if exists responses_set_updated_at on public.responses;
create trigger responses_set_updated_at
before update on public.responses
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

alter table public.admin_users enable row level security;
alter table public.clients enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_items enable row level security;
alter table public.responses enable row level security;

drop policy if exists "Admins can read their membership" on public.admin_users;
create policy "Admins can read their membership"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can read clients" on public.clients;
create policy "Admins can read clients"
on public.clients for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can create clients" on public.clients;
create policy "Admins can create clients"
on public.clients for insert to authenticated
with check (public.is_admin() and (created_by is null or created_by = (select auth.uid())));

drop policy if exists "Admins can update clients" on public.clients;
create policy "Admins can update clients"
on public.clients for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete clients" on public.clients;
create policy "Admins can delete clients"
on public.clients for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can read quizzes" on public.quizzes;
create policy "Admins can read quizzes"
on public.quizzes for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can create quizzes" on public.quizzes;
create policy "Admins can create quizzes"
on public.quizzes for insert to authenticated
with check (public.is_admin() and (created_by is null or created_by = (select auth.uid())));

drop policy if exists "Admins can update quizzes" on public.quizzes;
create policy "Admins can update quizzes"
on public.quizzes for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete quizzes" on public.quizzes;
create policy "Admins can delete quizzes"
on public.quizzes for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can read quiz items" on public.quiz_items;
create policy "Admins can read quiz items"
on public.quiz_items for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can create quiz items" on public.quiz_items;
create policy "Admins can create quiz items"
on public.quiz_items for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update quiz items" on public.quiz_items;
create policy "Admins can update quiz items"
on public.quiz_items for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete quiz items" on public.quiz_items;
create policy "Admins can delete quiz items"
on public.quiz_items for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can read responses" on public.responses;
create policy "Admins can read responses"
on public.responses for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can create responses" on public.responses;
create policy "Admins can create responses"
on public.responses for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update responses" on public.responses;
create policy "Admins can update responses"
on public.responses for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete responses" on public.responses;
create policy "Admins can delete responses"
on public.responses for delete to authenticated
using (public.is_admin());

-- Keep table access closed to anonymous clients. The two narrow RPCs below are
-- the only public data interface needed by the client quiz.
revoke all on public.admin_users, public.clients, public.quizzes, public.quiz_items, public.responses from anon;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.clients, public.quizzes, public.quiz_items, public.responses to authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.get_public_quiz(
  p_client_slug text,
  p_quiz_slug text,
  p_access_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if nullif(trim(p_client_slug), '') is null
     or nullif(trim(p_quiz_slug), '') is null
     or nullif(trim(p_access_token), '') is null then
    return null;
  end if;

  select jsonb_build_object(
    'client', jsonb_build_object('name', c.name, 'logo_url', c.logo_url),
    'quiz', jsonb_build_object(
      'id', q.id,
      'title', q.title,
      'intro_text', q.intro_text,
      'status', q.status
    ),
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', qi.id,
          'position', qi.position,
          'image_path', qi.image_path,
          'prompt', qi.prompt
        ) order by qi.position
      )
      from public.quiz_items qi
      where qi.quiz_id = q.id
    ), '[]'::jsonb),
    'responses', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'quiz_item_id', r.quiz_item_id,
          'rating', r.rating,
          'updated_at', r.updated_at
        ) order by r.updated_at
      )
      from public.responses r
      where r.quiz_id = q.id
    ), '[]'::jsonb)
  )
  into result
  from public.quizzes q
  join public.clients c on c.id = q.client_id
  where c.slug = lower(trim(p_client_slug))
    and q.slug = lower(trim(p_quiz_slug))
    and q.access_token = trim(p_access_token)
    and q.status = 'published';

  return result;
end;
$$;

create or replace function public.save_public_response(
  p_access_token text,
  p_quiz_item_id uuid,
  p_rating text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_quiz_id uuid;
begin
  if nullif(trim(p_access_token), '') is null or p_quiz_item_id is null then
    raise exception 'Invalid quiz response' using errcode = '22023';
  end if;

  if p_rating not in ('not_for_me', 'kinda_like', 'love_it') then
    raise exception 'Unsupported rating' using errcode = '22023';
  end if;

  select q.id
  into target_quiz_id
  from public.quizzes q
  join public.quiz_items qi on qi.quiz_id = q.id
  where qi.id = p_quiz_item_id
    and q.access_token = trim(p_access_token)
    and q.status = 'published';

  if target_quiz_id is null then
    raise exception 'Invalid quiz link' using errcode = '42501';
  end if;

  insert into public.responses (quiz_id, quiz_item_id, rating)
  values (target_quiz_id, p_quiz_item_id, p_rating)
  on conflict (quiz_item_id) do update
    set rating = excluded.rating,
        updated_at = now();

  return jsonb_build_object('ok', true, 'quiz_item_id', p_quiz_item_id, 'rating', p_rating);
end;
$$;

revoke all on function public.get_public_quiz(text, text, text) from public;
grant execute on function public.get_public_quiz(text, text, text) to anon, authenticated;
revoke all on function public.save_public_response(text, uuid, text) from public;
grant execute on function public.save_public_response(text, uuid, text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-references',
  'quiz-references',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read quiz reference objects" on storage.objects;
create policy "Admins can read quiz reference objects"
on storage.objects for select to authenticated
using (bucket_id = 'quiz-references' and public.is_admin());

drop policy if exists "Admins can upload quiz reference objects" on storage.objects;
create policy "Admins can upload quiz reference objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'quiz-references' and public.is_admin() and name like 'clients/%/quizzes/%/%');

drop policy if exists "Admins can update quiz reference objects" on storage.objects;
create policy "Admins can update quiz reference objects"
on storage.objects for update to authenticated
using (bucket_id = 'quiz-references' and public.is_admin())
with check (bucket_id = 'quiz-references' and public.is_admin());

drop policy if exists "Admins can delete quiz reference objects" on storage.objects;
create policy "Admins can delete quiz reference objects"
on storage.objects for delete to authenticated
using (bucket_id = 'quiz-references' and public.is_admin());
