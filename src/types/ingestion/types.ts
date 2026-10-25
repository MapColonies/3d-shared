import type { z } from 'zod';
import type { ingestion3DPayloadSchema, ingestion3DDeleteJobParamsSchema } from '../../schemas/ingestion/payloads.schema';
import type { shapeMetadataRowSchema } from '../../schemas/ingestion/shapeMetadata.schema';

export type Ingestion3DPayload = z.infer<typeof ingestion3DPayloadSchema>;
// export type Update3DLayerMetadata = z.infer<typeof update3DLayerMetadataSchema>;
// export type Aggregation3DMetadata = z.infer<typeof aggregation3DMetadataSchema>;
// export type Ingestion3DUpdateJobParams = z.infer<typeof ingestion3DUpdateJobParamsSchema>;
export type Ingestion3DDeleteJobParams = z.infer<typeof ingestion3DDeleteJobParamsSchema>;
export type ShapeMetadataRow = z.infer<typeof shapeMetadataRowSchema>;
export type ShapeMetadataResult<T> = { success: true; data: T } | { success: false; errors: string[] };
