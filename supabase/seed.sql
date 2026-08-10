-- Synthetic, local-only identities. These placeholder users cannot sign in.
insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'explorer-one@example.invalid',
    '{"full_name":"Explorer One"}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'explorer-two@example.invalid',
    '{"full_name":"Explorer Two"}'::jsonb
  );

-- A compact point set exercises viewport loading and client-side clustering.
insert into public.map_items (id, author_id, title, description, geometry)
select
  ('10000000-0000-4000-8000-' || lpad(point_number::text, 12, '0'))::uuid,
  case
    when point_number % 2 = 0 then '00000000-0000-4000-8000-000000000002'::uuid
    else '00000000-0000-4000-8000-000000000001'::uuid
  end,
  'Synthetic point ' || point_number,
  'Local seed record for map and clustering verification.',
  extensions.st_setsrid(
    extensions.st_makepoint(
      -122.425 + ((point_number % 6) * 0.002),
      37.770 + ((point_number / 6) * 0.002)
    ),
    4326
  )
from generate_series(1, 30) as point_number;

insert into public.map_items (id, author_id, title, description, geometry)
values (
  '20000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Synthetic neighborhood polygon',
  'Local seed polygon for geometry editing and viewport verification.',
  extensions.st_geomfromtext(
    'POLYGON((-122.430 37.768,-122.418 37.768,-122.418 37.778,-122.430 37.778,-122.430 37.768))',
    4326
  )
);

insert into public.map_updates (map_item_id, author_id, body)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'Synthetic collaborative update from Explorer Two.'
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'Synthetic polygon update from its author.'
  );
