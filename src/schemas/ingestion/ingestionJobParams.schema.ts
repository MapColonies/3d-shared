import { z } from 'zod';
import { new3DLayerMetadataSchema, update3DLayerMetadataSchema } from './metadata.schema';

const baseAdditionalParamsSchema = z.object({
  jobTrackerServiceURL: z.string().url(),
});

export const ingestion3DNewJobParamsSchema = z.object({
  metadata: new3DLayerMetadataSchema,
  additionalParams: baseAdditionalParamsSchema,
});

export const ingestion3DUpdateJobParamsSchema = z.object({
  metadata: update3DLayerMetadataSchema,
  additionalParams: baseAdditionalParamsSchema,
});

export const ingestion3DDeleteJobParamsSchema = z.object({
  productId: z.string(),
  productType: z.string(),
  catalogId: z.string(),
});
