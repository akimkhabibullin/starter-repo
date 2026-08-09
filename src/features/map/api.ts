import { getSupabaseClient } from '@/lib/supabase/client';
import { normalizeApplicationError } from '@/lib/supabase/errors';

import {
  boundsSchema,
  coordinateSchema,
  type Coordinate,
  type MapBounds,
  type MapItem,
  type MapItemDraft,
  mapItemDraftSchema,
  mapIdentifierSchema,
  mapItemsSchema,
  type MapUpdate,
  type MapUpdateDraft,
  mapUpdateDraftSchema,
  mapUpdatesSchema,
  polygonVerticesSchema,
} from './schemas';

export async function fetchMapItems(bounds: MapBounds): Promise<MapItem[]> {
  const validated = boundsSchema.parse(bounds);
  const { data, error } = await getSupabaseClient().rpc('map_items_in_view', {
    min_lat: validated.minLat,
    min_long: validated.minLong,
    max_lat: validated.maxLat,
    max_long: validated.maxLong,
  });

  if (error) throw normalizeApplicationError(error);
  return mapItemsSchema.parse(data);
}

export async function fetchMapUpdates(mapItemId: string): Promise<MapUpdate[]> {
  mapIdentifierSchema.parse(mapItemId);

  const { data, error } = await getSupabaseClient()
    .from('map_updates')
    .select('id, map_item_id, author_id, body, created_at, updated_at')
    .eq('map_item_id', mapItemId)
    .order('created_at', { ascending: true });

  if (error) throw normalizeApplicationError(error);
  return mapUpdatesSchema.parse(data);
}

function pointWkt(coordinate: Coordinate): string {
  const valid = coordinateSchema.parse(coordinate);
  return `SRID=4326;POINT(${valid.longitude} ${valid.latitude})`;
}

function polygonWkt(vertices: Coordinate[]): string {
  const valid = polygonVerticesSchema.parse(vertices);
  const first = valid[0];
  if (!first) throw new Error('A polygon requires vertices.');
  const ring = [...valid, first]
    .map((coordinate) => `${coordinate.longitude} ${coordinate.latitude}`)
    .join(',');
  return `SRID=4326;POLYGON((${ring}))`;
}

async function insertMapItem(draft: MapItemDraft, geometry: string): Promise<string> {
  const values = mapItemDraftSchema.parse(draft);
  const { data, error } = await getSupabaseClient()
    .from('map_items')
    .insert({ ...values, geometry })
    .select('id')
    .single();

  if (error) throw normalizeApplicationError(error);
  return data.id;
}

export async function createPoint(input: {
  draft: MapItemDraft;
  coordinate: Coordinate;
}): Promise<string> {
  return insertMapItem(input.draft, pointWkt(input.coordinate));
}

export async function createPolygon(input: {
  draft: MapItemDraft;
  vertices: Coordinate[];
}): Promise<string> {
  return insertMapItem(input.draft, polygonWkt(input.vertices));
}

export async function updateMapItem(input: { id: string; draft: MapItemDraft }): Promise<void> {
  const values = mapItemDraftSchema.parse(input.draft);
  const { error } = await getSupabaseClient().from('map_items').update(values).eq('id', input.id);
  if (error) throw normalizeApplicationError(error);
}

export async function deleteMapItem(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('map_items').delete().eq('id', id);
  if (error) throw normalizeApplicationError(error);
}

export async function createMapUpdate(input: {
  mapItemId: string;
  draft: MapUpdateDraft;
}): Promise<void> {
  const values = mapUpdateDraftSchema.parse(input.draft);
  const { error } = await getSupabaseClient()
    .from('map_updates')
    .insert({ map_item_id: input.mapItemId, body: values.body });
  if (error) throw normalizeApplicationError(error);
}

export async function updateMapUpdate(input: { id: string; draft: MapUpdateDraft }): Promise<void> {
  const values = mapUpdateDraftSchema.parse(input.draft);
  const { error } = await getSupabaseClient()
    .from('map_updates')
    .update({ body: values.body })
    .eq('id', input.id);
  if (error) throw normalizeApplicationError(error);
}

export async function deleteMapUpdate(id: string): Promise<void> {
  const { error } = await getSupabaseClient().from('map_updates').delete().eq('id', id);
  if (error) throw normalizeApplicationError(error);
}
