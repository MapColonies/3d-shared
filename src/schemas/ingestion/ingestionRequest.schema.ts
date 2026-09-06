import { z } from 'zod';
import { new3DLayerMetadataSchema, update3DLayerMetadataSchema } from './metadata.schema';

export const new3DLayerRequestSchema = new3DLayerMetadataSchema.extend({
  sourcePath: z.string(),
});

export const update3DLayerRequestSchema = update3DLayerMetadataSchema;
