import { z } from 'zod';
import { ingestion3DMetadataSchema } from './metadata.schema';

export const ingestion3DNewJobParamsSchema = z.object({
  metadata: ingestion3DMetadataSchema,
});

// export const ingestion3DUpdateJobParamsSchema = z.object({
//   metadata: update3DLayerMetadataSchema,
// });

export const ingestion3DDeleteJobParamsSchema = z.object({
  productId: z.string(),
});
