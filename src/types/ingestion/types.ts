import { z } from 'zod';
import {
  new3DLayerMetadataSchema,
  update3DLayerMetadataSchema,
  aggregation3DMetadataSchema,
} from '../../schemas/ingestion/metadata.schema';
import {
  new3DLayerRequestSchema,
  update3DLayerRequestSchema,
} from '../../schemas/ingestion/ingestionRequest.schema';
import {
  ingestion3DNewJobParamsSchema,
  ingestion3DUpdateJobParamsSchema,
  ingestion3DDeleteJobParamsSchema,
} from '../../schemas/ingestion/ingestionJobParams.schema';
import {
  ingestion3DNewFinalizeTaskParamsSchema,
  ingestion3DUpdateFinalizeTaskParamsSchema,
  ingestion3DDeleteTaskParamsSchema,
} from '../../schemas/ingestion/ingestionTaskParams.schema';

export type New3DLayerMetadata = z.infer<typeof new3DLayerMetadataSchema>;
export type Update3DLayerMetadata = z.infer<typeof update3DLayerMetadataSchema>;
export type Aggregation3DMetadata = z.infer<typeof aggregation3DMetadataSchema>;
export type New3DLayerRequest = z.infer<typeof new3DLayerRequestSchema>;
export type Update3DLayerRequest = z.infer<typeof update3DLayerRequestSchema>;
export type Ingestion3DNewJobParams = z.infer<typeof ingestion3DNewJobParamsSchema>;
export type Ingestion3DUpdateJobParams = z.infer<typeof ingestion3DUpdateJobParamsSchema>;
export type Ingestion3DDeleteJobParams = z.infer<typeof ingestion3DDeleteJobParamsSchema>;
export type Ingestion3DNewFinalizeTaskParams = z.infer<typeof ingestion3DNewFinalizeTaskParamsSchema>;
export type Ingestion3DUpdateFinalizeTaskParams = z.infer<typeof ingestion3DUpdateFinalizeTaskParamsSchema>;
export type Ingestion3DDeleteTaskParams = z.infer<typeof ingestion3DDeleteTaskParamsSchema>;
