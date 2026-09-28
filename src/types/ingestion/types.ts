import { z } from 'zod';
import { new3DLayerMetadataSchema, update3DLayerMetadataSchema, aggregation3DMetadataSchema } from '../../schemas/ingestion/metadata.schema';
import {
  ingestion3DNewJobParamsSchema,
  ingestion3DUpdateJobParamsSchema,
  ingestion3DDeleteJobParamsSchema,
} from '../../schemas/ingestion/ingestionJobParams.schema';

export type New3DLayerMetadata = z.infer<typeof new3DLayerMetadataSchema>;
export type Update3DLayerMetadata = z.infer<typeof update3DLayerMetadataSchema>;
export type Aggregation3DMetadata = z.infer<typeof aggregation3DMetadataSchema>;
export type Ingestion3DNewJobParams = z.infer<typeof ingestion3DNewJobParamsSchema>;
export type Ingestion3DUpdateJobParams = z.infer<typeof ingestion3DUpdateJobParamsSchema>;
export type Ingestion3DDeleteJobParams = z.infer<typeof ingestion3DDeleteJobParamsSchema>;
