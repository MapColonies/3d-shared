import { z } from 'zod';

const coordinate = z.union([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number(), z.number()])]);

const MIN_RING_POSITIONS = 4;

const linearRing = z
  .array(coordinate)
  .min(MIN_RING_POSITIONS)
  .refine((ring) => ring.every((position) => position.length === ring[0]?.length), { message: 'ring positions must be all 2D or all 3D' });

export const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(linearRing),
});

export const multiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(linearRing)),
});

export const geometrySchema = z.union([polygonSchema, multiPolygonSchema]);
