import {
  boundsSchema,
  coordinateSchema,
  mapItemDraftSchema,
  polygonVerticesSchema,
} from '../schemas';

describe('map schemas', () => {
  test('accepts boundary coordinates and rejects out-of-range coordinates', () => {
    expect(coordinateSchema.safeParse({ latitude: 90, longitude: -180 }).success).toBe(true);
    expect(coordinateSchema.safeParse({ latitude: 90.1, longitude: 0 }).success).toBe(false);
  });

  test('requires ordered non-empty viewport bounds', () => {
    expect(boundsSchema.safeParse({ minLat: 1, maxLat: 0, minLong: -1, maxLong: 1 }).success).toBe(
      false,
    );
  });

  test('requires three through one hundred polygon vertices', () => {
    expect(
      polygonVerticesSchema.safeParse([
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ]).success,
    ).toBe(false);
  });

  test('trims and bounds map item form values', () => {
    expect(mapItemDraftSchema.parse({ title: '  Place  ', description: ' note ' })).toEqual({
      title: 'Place',
      description: 'note',
    });
  });
});
