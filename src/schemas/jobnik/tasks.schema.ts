import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { STORAGE_PROVIDERS } from '../../constants/jobnik';
import { geometrySchema } from '../core/geo.schema';
import { modelIdSchema, productIdSchema, productNameSchema, relativePathSchema, srsIdSchema } from './common.schema';

const range = ({ min, max }: { min: number; max: number }): z.ZodNumber => z.number().min(min).max(max);

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
});

export const recordMetadataSchema = z
  .object({
    productId: productIdSchema,
    productName: productNameSchema,
    productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
    productSubType: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    classification: z.string().trim().regex(new RegExp(INGESTION_VALIDATIONS.classification.pattern)),
    srsId: srsIdSchema,
    srsName: z.string().trim().min(1),
    producerName: z.string().trim().min(1),
    productionSystem: z.string().trim().min(1),
    productionSystemVersion: z.string().trim().min(1),
    productionDate: z.string().datetime({ offset: true }),
    imagingTimeBeginUTC: z.coerce.date(),
    imagingTimeEndUTC: z.coerce.date(),
    minResolutionMeter: range(INGESTION_VALIDATIONS.resolutionMeter),
    maxResolutionMeter: range(INGESTION_VALIDATIONS.resolutionMeter),
    maxAbsoluteAccuracyCEP90: range(INGESTION_VALIDATIONS.accuracy),
    maxAbsoluteAccuracyLEP90: range(INGESTION_VALIDATIONS.accuracy),
    maxAbsoluteAccuracySEP90: range(INGESTION_VALIDATIONS.absoluteAccuracySep90).optional(),
    maxRelativeAccuracyCEP90: range(INGESTION_VALIDATIONS.accuracy).optional(),
    maxRelativeAccuracyLEP90: range(INGESTION_VALIDATIONS.accuracy).optional(),
    maxRelativeAccuracySEP90: range(INGESTION_VALIDATIONS.relativeAccuracySep90).optional(),
    sensors: z.array(z.string().trim().min(1)).min(INGESTION_VALIDATIONS.sensors.minItems),
  })
  .strict()
  .refine((metadata) => metadata.minResolutionMeter <= metadata.maxResolutionMeter, {
    path: ['minResolutionMeter'],
    message: 'must not be greater than maxResolutionMeter',
  })
  .refine((metadata) => metadata.imagingTimeBeginUTC <= metadata.imagingTimeEndUTC, {
    path: ['imagingTimeBeginUTC'],
    message: 'must not be later than imagingTimeEndUTC',
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
