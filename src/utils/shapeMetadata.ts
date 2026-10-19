import type { ZodError, ZodType, ZodTypeDef } from 'zod';
import { shapeMetadataCommonSchema, shapeMetadataRowSchema } from '../schemas/ingestion/shapeMetadata.schema';
import type { ShapeMetadataCommon, ShapeMetadataResult, ShapeMetadataRow } from '../types/ingestion/shapeMetadata';

type Properties = Record<string, unknown>;

const isMissing = (value: unknown): boolean => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const toErrors = (error: ZodError, properties: Properties): string[] =>
  error.issues.map((issue) => {
    const field = issue.path.join('.');
    return `ShapeMetadata: ${field} ${isMissing(properties[field]) ? 'is mandatory' : issue.message}`;
  });

const extract = <T>(schema: ZodType<T, ZodTypeDef, unknown>, properties: Properties): ShapeMetadataResult<T> => {
  const result = schema.safeParse(properties);
  return result.success ? { success: true, data: result.data } : { success: false, errors: toErrors(result.error, properties) };
};

export const extractCommonShapeMetadata = (properties: Properties): ShapeMetadataResult<ShapeMetadataCommon> =>
  extract(shapeMetadataCommonSchema, properties);

export const extractShapeMetadataRow = (properties: Properties): ShapeMetadataResult<ShapeMetadataRow> => extract(shapeMetadataRowSchema, properties);
