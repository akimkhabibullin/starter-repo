create function public.map_items_in_view(
  min_lat double precision,
  min_long double precision,
  max_lat double precision,
  max_long double precision
)
returns table (
  id uuid,
  author_id uuid,
  title text,
  description text,
  geometry_geojson jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
set search_path = ''
as $$
  select
    item.id,
    item.author_id,
    item.title,
    item.description,
    extensions.st_asgeojson(item.geometry)::jsonb as geometry_geojson,
    item.created_at,
    item.updated_at
  from public.map_items as item
  where min_lat between -90 and 90
    and max_lat between -90 and 90
    and min_long between -180 and 180
    and max_long between -180 and 180
    and min_lat < max_lat
    and min_long < max_long
    and item.geometry operator(extensions.&&) extensions.st_setsrid(
      extensions.st_makebox2d(
        extensions.st_point(min_long, min_lat),
        extensions.st_point(max_long, max_lat)
      ),
      4326
    )
  order by item.updated_at desc
  limit 500;
$$;

revoke all on function public.map_items_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) from public, anon;

grant execute on function public.map_items_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) to authenticated, service_role;
