import type { z } from 'zod';
import type { new3DLayerMetadataSchema, aggregation3DMetadataSchema } from '../../schemas/ingestion/metadata.schema';
import type { ingestion3DNewJobParamsSchema, ingestion3DDeleteJobParamsSchema } from '../../schemas/ingestion/ingestionJobParams.schema';
import type { shapeMetadataRowSchema } from '../../schemas/ingestion/shapeMetadata.schema';

export type New3DLayerMetadata = z.infer<typeof new3DLayerMetadataSchema>;
// export type Update3DLayerMetadata = z.infer<typeof update3DLayerMetadataSchema>;
export type Aggregation3DMetadata = z.infer<typeof aggregation3DMetadataSchema>;
export type Ingestion3DNewJobParams = z.infer<typeof ingestion3DNewJobParamsSchema>;
// export type Ingestion3DUpdateJobParams = z.infer<typeof ingestion3DUpdateJobParamsSchema>;
export type Ingestion3DDeleteJobParams = z.infer<typeof ingestion3DDeleteJobParamsSchema>;
export type ShapeMetadataRow = z.infer<typeof shapeMetadataRowSchema>;
export type ShapeMetadataResult<T> = { success: true; data: T } | { success: false; errors: string[] };
