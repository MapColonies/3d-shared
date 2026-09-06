import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST, CORE_VALIDATIONS } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { geometrySchema } from '../core/geo.schema';

export const base3DLayerMetadataSchema = z.object({
  classification: z.string(),
});

export const new3DLayerMetadataSchema = base3DLayerMetadataSchema.extend({
  productId: z.string(),
  productName: z.string().max(INGESTION_VALIDATIONS.productName.maxLength),
  productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  srsId: z.literal('4326'),
  srsName: z.literal('WGS84GEO'),
  region: z.array(z.string()).min(INGESTION_VALIDATIONS.region.minItems),
  producerName: z.string().optional(),
  productionSystem: z.string(),
  productionSystemVer: z.string().max(INGESTION_VALIDATIONS.productionSystemVer.maxLength),
  productionDate: z.string(),
});

export const update3DLayerMetadataSchema = z.object({
  productName: z.string().max(INGESTION_VALIDATIONS.productName.maxLength).optional(),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  classification: z.string().optional(),
});

export const aggregation3DMetadataSchema = z
  .object({
    footprint: geometrySchema,
    sourceDateStart: z.date(),
    sourceDateEnd: z.date(),
    maxAbsoluteAccuracyCEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max),
    maxRelativeAccuracyCEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max),
    maxRelativeAccuracyLEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max),
    maxAbsoluteAccuracyLEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max)
      .optional(),
    maxAbsoluteAccuracySEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max)
      .optional(),
    maxRelativeAccuracySEP90: z
      .number()
      .min(CORE_VALIDATIONS.accuracy.min)
      .max(CORE_VALIDATIONS.accuracy.max)
      .optional(),
    maxResolutionMeter: z
      .number()
      .min(CORE_VALIDATIONS.resolutionMeter.min)
      .max(CORE_VALIDATIONS.resolutionMeter.max),
    minResolutionMeter: z
      .number()
      .min(CORE_VALIDATIONS.resolutionMeter.min)
      .max(CORE_VALIDATIONS.resolutionMeter.max),
    productBoundingBox: z.string(),
    sensors: z.array(z.string()).min(INGESTION_VALIDATIONS.sensors.minItems),
  })
  .strict()
  .refine((data) => data.sourceDateStart <= data.sourceDateEnd, {
    message: 'sourceDateStart must not be later than sourceDateEnd',
    path: ['sourceDateStart'],
  });
