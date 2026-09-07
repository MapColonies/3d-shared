import { z } from 'zod';

const coordinate = z.union([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number(), z.number()])]);

export const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinate)),
});

export const multiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(coordinate))),
});

export const geometrySchema = z.union([polygonSchema, multiPolygonSchema]);
