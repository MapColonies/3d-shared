import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { STORAGE_PROVIDERS } from '../../constants/jobnik';
import { geometrySchema } from '../core/geo.schema';
import { modelIdSchema, relativePathSchema } from './common.schema';

export const validateShapefilesTaskSchema = z.object({
  modelId: modelIdSchema,
  metadataShapefilePath: relativePathSchema,
});

export const extract3tzTaskSchema = z.object({
  archivePath: relativePathSchema,
  tempDir: relativePathSchema,
});

export const planUploadTaskSchema = z.object({
  sourceDir: relativePathSchema,
  s3KeyPrefix: modelIdSchema,
});

export const uploadFilesTaskSchema = planUploadTaskSchema.extend({
  keys: z.array(relativePathSchema).min(1),
});

export const deleteFilesTaskSchema = z.object({
  storageProvider: z.nativeEnum(STORAGE_PROVIDERS),
  paths: z.array(relativePathSchema).min(1),
});

export const insertPartsTaskSchema = z.object({
  modelId: modelIdSchema,
  metadataShapefilePath: relativePathSchema,
  productVersion: z.number().int().positive(),
});

export const recordMetadataSchema = z.object({
  productId: z.string().trim().min(1),
  productName: z.string().trim().min(1).max(INGESTION_VALIDATIONS.productName.maxLength),
  productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  classification: z.string().trim().regex(new RegExp(INGESTION_VALIDATIONS.classification.pattern)),
  srsId: z.string().trim().min(1),
  srsName: z.string().trim().min(1),
  producerName: z.string().trim().min(1),
  productionSystem: z.string().trim().min(1),
  productionSystemVersion: z.string().trim().min(1),
  productionDate: z.string().datetime(),
  imagingTimeBeginUTC: z.coerce.date(),
  imagingTimeEndUTC: z.coerce.date(),
  minResolutionMeter: z.number(),
  maxResolutionMeter: z.number(),
  maxAbsoluteAccuracyCEP90: z.number(),
  maxAbsoluteAccuracyLEP90: z.number(),
  maxAbsoluteAccuracySEP90: z.number().optional(),
  maxRelativeAccuracyCEP90: z.number().optional(),
  maxRelativeAccuracyLEP90: z.number().optional(),
  maxRelativeAccuracySEP90: z.number().optional(),
  sensors: z.array(z.string().trim().min(1)).min(INGESTION_VALIDATIONS.sensors.minItems),
});

export const insertRecordTaskSchema = z.object({
  modelId: modelIdSchema,
  tilesetFilename: z.string().trim().min(1),
  metadata: recordMetadataSchema,
  footprint: geometrySchema,
  region: z.array(z.string().trim().min(1)).min(INGESTION_VALIDATIONS.region.minItems),
});

export const modelTaskSchema = z.object({
  modelId: modelIdSchema,
});

export const deletePartsTaskSchema = modelTaskSchema;
export const deleteRecordTaskSchema = modelTaskSchema;
