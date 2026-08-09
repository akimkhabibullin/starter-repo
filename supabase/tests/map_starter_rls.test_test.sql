begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '90000000-0000-4000-8000-000000000001',
    'rls-owner@example.invalid',
    '{"full_name":"RLS Owner"}'::jsonb
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    'rls-collaborator@example.invalid',
    '{"full_name":"RLS Collaborator"}'::jsonb
  ),
  (
    '90000000-0000-4000-8000-000000000003',
    'rls-observer@example.invalid',
    '{"full_name":"RLS Observer"}'::jsonb
  );

insert into public.map_items (
  id,
  author_id,
  title,
  geometry,
  moderation_status
)
values
  (
    '91000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000001',
    'Owner visible item',
    extensions.st_geomfromtext('POINT(-122.42 37.77)', 4326),
    'visible'
  ),
  (
    '91000000-0000-4000-8000-000000000002',
    '90000000-0000-4000-8000-000000000002',
    'Collaborator visible item',
    extensions.st_geomfromtext('POINT(-122.41 37.78)', 4326),
    'visible'
  ),
  (
    '91000000-0000-4000-8000-000000000003',
    '90000000-0000-4000-8000-000000000002',
    'Collaborator hidden item',
    extensions.st_geomfromtext('POINT(-122.40 37.79)', 4326),
    'hidden'
  ),
  (
    '91000000-0000-4000-8000-000000000004',
    '90000000-0000-4000-8000-000000000001',
    'Owner disposable item',
    extensions.st_geomfromtext('POINT(-122.39 37.80)', 4326),
    'visible'
  );

insert into public.map_updates (id, map_item_id, author_id, body)
values
  (
    '92000000-0000-4000-8000-000000000001',
    '91000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000002',
    'Collaborator update'
  ),
  (
    '92000000-0000-4000-8000-000000000002',
    '91000000-0000-4000-8000-000000000001',
    '90000000-0000-4000-8000-000000000001',
    'Owner disposable update'
  );

set local role anon;

select throws_ok(
  $$select * from public.map_items$$,
  null::text,
  null::text,
  'Unauthenticated users cannot read protected map items'
);

select throws_ok(
  $$insert into public.map_items (title, geometry)
    values ('Anonymous item', extensions.st_geomfromtext('POINT(0 0)', 4326))$$,
  null::text,
  null::text,
  'Unauthenticated users cannot create protected map items'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '90000000-0000-4000-8000-000000000001';

select results_eq(
  $$select count(*) from public.map_items$$,
  array[3::bigint],
  'Authenticated users read all visible shared items and not hidden items'
);

select throws_ok(
  $$insert into public.map_items (author_id, title, geometry)
    values (
      '90000000-0000-4000-8000-000000000002',
      'Forged owner',
      extensions.st_geomfromtext('POINT(0 0)', 4326)
    )$$,
  null::text,
  null::text,
  'Authenticated users cannot insert map items for another user'
);

select results_eq(
  $$update public.map_items
    set title = 'Owner edited'
    where id = '91000000-0000-4000-8000-000000000001'
    returning title$$,
  array['Owner edited'::text],
  'Owners can update their own map items'
);

select results_eq(
  $$delete from public.map_items
    where id = '91000000-0000-4000-8000-000000000004'
    returning id$$,
  array['91000000-0000-4000-8000-000000000004'::uuid],
  'Owners can delete their own map items'
);

select is_empty(
  $$update public.map_items
    set title = 'Unauthorized edit'
    where id = '91000000-0000-4000-8000-000000000002'
    returning id$$,
  'Non-owners cannot update another author''s map items'
);

select is_empty(
  $$delete from public.map_items
    where id = '91000000-0000-4000-8000-000000000002'
    returning id$$,
  'Non-owners cannot delete another author''s map items'
);

select results_eq(
  $$update public.map_updates
    set body = 'Owner edited update'
    where id = '92000000-0000-4000-8000-000000000002'
    returning body$$,
  array['Owner edited update'::text],
  'Update authors can edit their own updates'
);

select is_empty(
  $$update public.map_updates
    set body = 'Unauthorized update edit'
    where id = '92000000-0000-4000-8000-000000000001'
    returning id$$,
  'Non-authors cannot update another author''s updates'
);

select is_empty(
  $$delete from public.map_updates
    where id = '92000000-0000-4000-8000-000000000001'
    returning id$$,
  'Non-authors cannot delete another author''s updates'
);

select results_eq(
  $$delete from public.map_updates
    where id = '92000000-0000-4000-8000-000000000002'
    returning id$$,
  array['92000000-0000-4000-8000-000000000002'::uuid],
  'Update authors can delete their own updates'
);

select lives_ok(
  $$insert into public.content_reports (map_item_id, reason, details)
    values (
      '91000000-0000-4000-8000-000000000002',
      'Synthetic report reason',
      'Synthetic report details'
    )$$,
  'Authenticated users can submit reports'
);

select throws_ok(
  $$select * from public.content_reports$$,
  null::text,
  null::text,
  'Ordinary users cannot enumerate reports'
);

select lives_ok(
  $$insert into public.user_blocks (blocked_id)
    values ('90000000-0000-4000-8000-000000000002')$$,
  'Users can create their own block rows'
);

select results_eq(
  $$select count(*) from public.user_blocks$$,
  array[1::bigint],
  'The blocker can read the block row they created'
);

set local request.jwt.claim.sub = '90000000-0000-4000-8000-000000000002';

select results_eq(
  $$select count(*) from public.user_blocks$$,
  array[0::bigint],
  'Blocked users cannot discover another user''s private block row'
);

set local request.jwt.claim.sub = '90000000-0000-4000-8000-000000000001';

select results_eq(
  $$select count(*) from public.map_items
    where author_id = '90000000-0000-4000-8000-000000000002'$$,
  array[0::bigint],
  'Blocked authors are omitted from the map item query path'
);

select results_eq(
  $$select count(*) from public.map_updates
    where author_id = '90000000-0000-4000-8000-000000000002'$$,
  array[0::bigint],
  'Blocked authors are omitted from the map update query path'
);

set local request.jwt.claim.sub = '90000000-0000-4000-8000-000000000003';

select results_eq(
  $$select count(*) from public.map_items
    where moderation_status <> 'visible'$$,
  array[0::bigint],
  'Hidden or rejected content is not returned to ordinary users'
);

select results_eq(
  $$select count(*) from public.map_items_in_view(
      37.76::double precision,
      -122.43::double precision,
      37.79::double precision,
      -122.40::double precision
    )$$,
  array[2::bigint],
  'The viewport RPC returns only visible items intersecting bounded coordinates'
);

select results_eq(
  $$select count(*) from public.map_items_in_view(
      91::double precision,
      -122.43::double precision,
      92::double precision,
      -122.40::double precision
    )$$,
  array[0::bigint],
  'The viewport RPC rejects out-of-range coordinate bounds with an empty result'
);

select throws_ok(
  $$insert into public.map_items (title, geometry)
    values (
      'Invalid line',
      extensions.st_geomfromtext('LINESTRING(0 0, 1 1)', 4326)
    )$$,
  '23514',
  null,
  'Unsupported geometry types violate the map item constraint'
);

select throws_ok(
  $$insert into public.map_items (title, geometry)
    values (
      'Invalid SRID',
      extensions.st_geomfromtext('POINT(0 0)', 3857)
    )$$,
  null::text,
  null::text,
  'Geometry with a non-4326 SRID is rejected'
);

reset role;

insert into auth.users (id, email, raw_user_meta_data)
values (
  '90000000-0000-4000-8000-000000000004',
  'cascade-user@example.invalid',
  '{"full_name":"Cascade User"}'::jsonb
);

insert into public.map_items (id, author_id, title, geometry)
values (
  '91000000-0000-4000-8000-000000000005',
  '90000000-0000-4000-8000-000000000004',
  'Cascade item',
  extensions.st_geomfromtext('POINT(-122.38 37.81)', 4326)
);

insert into public.map_updates (map_item_id, author_id, body)
values (
  '91000000-0000-4000-8000-000000000005',
  '90000000-0000-4000-8000-000000000004',
  'Cascade update'
);

insert into public.content_reports (reporter_id, map_item_id, reason)
values (
  '90000000-0000-4000-8000-000000000004',
  '91000000-0000-4000-8000-000000000005',
  'Cascade report'
);

insert into public.user_blocks (blocker_id, blocked_id)
values (
  '90000000-0000-4000-8000-000000000004',
  '90000000-0000-4000-8000-000000000003'
);

delete from auth.users
where id = '90000000-0000-4000-8000-000000000004';

select results_eq(
  $$select (
      (select count(*) from public.profiles
        where id = '90000000-0000-4000-8000-000000000004')
      + (select count(*) from public.map_items
        where author_id = '90000000-0000-4000-8000-000000000004')
      + (select count(*) from public.map_updates
        where author_id = '90000000-0000-4000-8000-000000000004')
      + (select count(*) from public.content_reports
        where reporter_id = '90000000-0000-4000-8000-000000000004')
      + (select count(*) from public.user_blocks
        where blocker_id = '90000000-0000-4000-8000-000000000004'
          or blocked_id = '90000000-0000-4000-8000-000000000004')
    )::bigint$$,
  array[0::bigint],
  'Deleting an auth user cascades all owned application data'
);

select * from finish();
rollback;
