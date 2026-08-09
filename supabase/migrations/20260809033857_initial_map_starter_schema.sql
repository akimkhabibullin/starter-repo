create schema if not exists extensions;
create extension if not exists postgis schema extensions;

create type public.moderation_status as enum ('visible', 'hidden', 'removed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Map Explorer'
    check (char_length(display_name) between 1 and 80),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.map_items (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 4000),
  geometry extensions.geometry(Geometry, 4326) not null,
  moderation_status public.moderation_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint map_items_supported_geometry_check check (
    extensions.st_geometrytype(geometry) in ('ST_Point', 'ST_Polygon')
  ),
  constraint map_items_srid_check check (extensions.st_srid(geometry) = 4326),
  constraint map_items_valid_geometry_check check (extensions.st_isvalid(geometry))
);

create table public.map_updates (
  id uuid primary key default gen_random_uuid(),
  map_item_id uuid not null references public.map_items (id) on delete cascade,
  author_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  moderation_status public.moderation_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  map_item_id uuid references public.map_items (id) on delete cascade,
  map_update_id uuid references public.map_updates (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 120),
  details text not null default '' check (char_length(details) <= 2000),
  created_at timestamptz not null default now(),
  constraint content_reports_target_check check (
    (map_item_id is not null)::integer + (map_update_id is not null)::integer = 1
  )
);

create table public.user_blocks (
  blocker_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_distinct_users_check check (blocker_id <> blocked_id)
);

create index map_items_author_id_idx on public.map_items (author_id);
create index map_items_moderation_status_idx on public.map_items (moderation_status);
create index map_items_geometry_gist_idx on public.map_items using gist (geometry);
create index map_updates_map_item_id_idx on public.map_updates (map_item_id);
create index map_updates_author_id_idx on public.map_updates (author_id);
create index content_reports_reporter_id_idx on public.content_reports (reporter_id);
create index content_reports_map_item_id_idx on public.content_reports (map_item_id);
create index content_reports_map_update_id_idx on public.content_reports (map_update_id);
create index user_blocks_blocked_id_idx on public.user_blocks (blocked_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger map_items_set_updated_at
before update on public.map_items
for each row execute function public.set_updated_at();

create trigger map_updates_set_updated_at
before update on public.map_updates
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(left(new.raw_user_meta_data ->> 'full_name', 80), ''),
      nullif(left(new.raw_user_meta_data ->> 'name', 80), ''),
      'Map Explorer'
    ),
    nullif(left(new.raw_user_meta_data ->> 'avatar_url', 2048), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.map_items enable row level security;
alter table public.map_updates enable row level security;
alter table public.content_reports enable row level security;
alter table public.user_blocks enable row level security;

create policy "Authenticated users can read unblocked profiles"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or not exists (
    select 1
    from public.user_blocks
    where blocker_id = (select auth.uid())
      and blocked_id = profiles.id
  )
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Authenticated users can read visible unblocked map items"
on public.map_items
for select
to authenticated
using (
  moderation_status = 'visible'
  and not exists (
    select 1
    from public.user_blocks
    where blocker_id = (select auth.uid())
      and blocked_id = map_items.author_id
  )
);

create policy "Authors can read their own map items"
on public.map_items
for select
to authenticated
using (author_id = (select auth.uid()));

create policy "Authors can create visible map items"
on public.map_items
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and moderation_status = 'visible'
);

create policy "Authors can update their own map items"
on public.map_items
for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Authors can delete their own map items"
on public.map_items
for delete
to authenticated
using (author_id = (select auth.uid()));

create policy "Authenticated users can read visible unblocked map updates"
on public.map_updates
for select
to authenticated
using (
  moderation_status = 'visible'
  and not exists (
    select 1
    from public.user_blocks
    where blocker_id = (select auth.uid())
      and blocked_id = map_updates.author_id
  )
  and exists (
    select 1
    from public.map_items
    where map_items.id = map_updates.map_item_id
  )
);

create policy "Authors can read their own map updates"
on public.map_updates
for select
to authenticated
using (author_id = (select auth.uid()));

create policy "Authors can create visible map updates"
on public.map_updates
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and moderation_status = 'visible'
  and exists (
    select 1
    from public.map_items
    where map_items.id = map_updates.map_item_id
  )
);

create policy "Authors can update their own map updates"
on public.map_updates
for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Authors can delete their own map updates"
on public.map_updates
for delete
to authenticated
using (author_id = (select auth.uid()));

create policy "Users can create their own reports"
on public.content_reports
for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy "Users can read blocks they created"
on public.user_blocks
for select
to authenticated
using (blocker_id = (select auth.uid()));

create policy "Users can create their own blocks"
on public.user_blocks
for insert
to authenticated
with check (blocker_id = (select auth.uid()));

create policy "Users can remove their own blocks"
on public.user_blocks
for delete
to authenticated
using (blocker_id = (select auth.uid()));

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.map_items from anon, authenticated;
revoke all on table public.map_updates from anon, authenticated;
revoke all on table public.content_reports from anon, authenticated;
revoke all on table public.user_blocks from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

grant select, delete on table public.map_items to authenticated;
grant insert (title, description, geometry) on table public.map_items to authenticated;
grant update (title, description, geometry) on table public.map_items to authenticated;

grant select, delete on table public.map_updates to authenticated;
grant insert (map_item_id, body) on table public.map_updates to authenticated;
grant update (body) on table public.map_updates to authenticated;

grant insert (map_item_id, map_update_id, reason, details)
on table public.content_reports to authenticated;

grant select, delete on table public.user_blocks to authenticated;
grant insert (blocked_id) on table public.user_blocks to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.map_items to service_role;
grant all on table public.map_updates to service_role;
grant all on table public.content_reports to service_role;
grant all on table public.user_blocks to service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter publication supabase_realtime add table public.map_items, public.map_updates;
