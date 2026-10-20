import type { ZodError, ZodType, ZodTypeDef } from 'zod';
import { shapeMetadataCommonSchema, shapeMetadataRowSchema } from '../schemas/ingestion/shapeMetadata.schema';
import type { ShapeMetadataCommon, ShapeMetadataResult, ShapeMetadataRow } from '../types/ingestion/types';
import { isEmptyValue } from './typeUtils';

type Properties = Record<string, unknown>;

const toErrors = (error: ZodError, properties: Properties): string[] =>
  error.issues.map((issue) => {
    const field = String(issue.path[issue.path.length - 1]);
    return `ShapeMetadata: ${field} ${isEmptyValue(properties[field]) ? 'is mandatory' : issue.message}`;
  });

const extract = <T>(schema: ZodType<T, ZodTypeDef, unknown>, properties: Properties): ShapeMetadataResult<T> => {
  const result = schema.safeParse(properties);
  return result.success ? { success: true, data: result.data } : { success: false, errors: toErrors(result.error, properties) };
};

export const extractCommonShapeMetadata = (properties: Properties): ShapeMetadataResult<ShapeMetadataCommon> =>
  extract(shapeMetadataCommonSchema, properties);

export const extractShapeMetadataRow = (properties: Properties): ShapeMetadataResult<ShapeMetadataRow> => extract(shapeMetadataRowSchema, properties);
