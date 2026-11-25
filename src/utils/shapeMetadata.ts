import { shapeMetadataRowSchema } from '../schemas/ingestion/shapeMetadata.schema';
import type { ShapeMetadataResult, ShapeMetadataRow } from '../types/ingestion/types';

const toErrors = (prefix: string, issues: { path: (string | number)[]; message: string }[]): string[] =>
  issues.map((issue) => `${prefix}: ${issue.path.join('.')} ${issue.message}`);

export const extractShapeMetadataRow = (properties: Record<string, unknown>): ShapeMetadataResult<ShapeMetadataRow> => {
  const result = shapeMetadataRowSchema.safeParse(properties);
  return result.success ? { success: true, data: result.data } : { success: false, errors: toErrors('ShapeMetadata', result.error.issues) };
};

export const extractShapeMetadataRows = (rows: Record<string, unknown>[]): ShapeMetadataResult<ShapeMetadataRow[]> => {
  const data: ShapeMetadataRow[] = [];
  const errors: string[] = [];
  rows.forEach((properties, index) => {
    const result = shapeMetadataRowSchema.safeParse(properties);
    if (result.success) {
      data.push(result.data);
    } else {
      errors.push(...toErrors(`ShapeMetadata row ${index + 1}`, result.error.issues));
    }
  });
  if (rows.length === 0) {
    errors.push('ShapeMetadata: must contain at least one row');
  }
  return errors.length === 0 ? { success: true, data } : { success: false, errors };
};
