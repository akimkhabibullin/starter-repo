import { z } from 'zod';

export const mapIdentifierSchema = z.uuid();

export const coordinateSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const boundsSchema = z
  .object({
    minLat: z.number().finite().min(-90).max(90),
    minLong: z.number().finite().min(-180).max(180),
    maxLat: z.number().finite().min(-90).max(90),
    maxLong: z.number().finite().min(-180).max(180),
  })
  .refine((bounds) => bounds.minLat < bounds.maxLat, 'Latitude bounds are invalid.')
  .refine((bounds) => bounds.minLong < bounds.maxLong, 'Longitude bounds are invalid.');

const coordinateTupleSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);

const pointGeometrySchema = z.object({
  type: z.literal('Point'),
  coordinates: coordinateTupleSchema,
});

const polygonGeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinateTupleSchema).min(4)).min(1),
});

export const mapItemSchema = z.object({
  id: mapIdentifierSchema,
  author_id: mapIdentifierSchema,
  title: z.string().min(1).max(120),
  description: z.string().max(4000),
  geometry_geojson: z.discriminatedUnion('type', [pointGeometrySchema, polygonGeometrySchema]),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const mapItemsSchema = z.array(mapItemSchema);

export const mapItemDraftSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.').max(120),
  description: z.string().trim().max(4000),
});

export const polygonVerticesSchema = z.array(coordinateSchema).min(3).max(100);

export const mapUpdateSchema = z.object({
  id: mapIdentifierSchema,
  map_item_id: mapIdentifierSchema,
  author_id: mapIdentifierSchema,
  body: z.string().min(1).max(2000),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const mapUpdatesSchema = z.array(mapUpdateSchema);

export const mapUpdateDraftSchema = z.object({
  body: z.string().trim().min(1, 'Enter an update.').max(2000),
});

export type Coordinate = z.infer<typeof coordinateSchema>;
export type MapBounds = z.infer<typeof boundsSchema>;
export type MapItem = z.infer<typeof mapItemSchema>;
export type MapItemDraft = z.infer<typeof mapItemDraftSchema>;
export type MapUpdate = z.infer<typeof mapUpdateSchema>;
export type MapUpdateDraft = z.infer<typeof mapUpdateDraftSchema>;
