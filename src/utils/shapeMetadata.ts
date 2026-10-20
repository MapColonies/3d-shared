import { shapeMetadataRowSchema } from '../schemas/ingestion/shapeMetadata.schema';
import type { ShapeMetadataResult, ShapeMetadataRow } from '../types/ingestion/types';

export const extractShapeMetadataRow = (properties: Record<string, unknown>): ShapeMetadataResult<ShapeMetadataRow> => {
  const result = shapeMetadataRowSchema.safeParse(properties);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: result.error.issues.map((issue) => `ShapeMetadata: ${issue.path.join('.')} ${issue.message}`) };
};
