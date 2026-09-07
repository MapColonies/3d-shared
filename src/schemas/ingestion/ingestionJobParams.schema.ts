import { z } from 'zod';
import { new3DLayerMetadataSchema, update3DLayerMetadataSchema } from './metadata.schema';

export const ingestion3DNewJobParamsSchema = z.object({
  metadata: new3DLayerMetadataSchema,
});

export const ingestion3DUpdateJobParamsSchema = z.object({
  metadata: update3DLayerMetadataSchema,
});

export const ingestion3DDeleteJobParamsSchema = z.object({
  productId: z.string(),
});
