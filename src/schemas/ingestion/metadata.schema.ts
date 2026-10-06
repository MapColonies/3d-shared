import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { geometrySchema } from '../core/geo.schema';

export const new3DLayerMetadataSchema = z.object({
  productId: z.string(),
  productName: z.string().max(INGESTION_VALIDATIONS.productName.maxLength),
  productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  classification: z.string(),
  srsId: z.literal('4326'),
  srsName: z.literal('WGS84GEO'),
  region: z.array(z.string()).min(INGESTION_VALIDATIONS.region.minItems),
  producerName: z.string(),
  productionSystem: z.string(),
  productionSystemVersion: z.string().max(INGESTION_VALIDATIONS.productionSystemVersion.maxLength),
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
    imagingTimeBeginUTC: z.coerce.date(),
    imagingTimeEndUTC: z.coerce.date(),
    maxAbsoluteAccuracyCEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max),
    maxAbsoluteAccuracyLEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max),
    maxRelativeAccuracyCEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max).optional(),
    maxRelativeAccuracyLEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max).optional(),
    maxAbsoluteAccuracySEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max).optional(),
    maxRelativeAccuracySEP90: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max).optional(),
    visualAccuracy: z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max).optional(),
    maxResolutionMeter: z.number().min(INGESTION_VALIDATIONS.resolutionMeter.min).max(INGESTION_VALIDATIONS.resolutionMeter.max),
    minResolutionMeter: z.number().min(INGESTION_VALIDATIONS.resolutionMeter.min).max(INGESTION_VALIDATIONS.resolutionMeter.max),
    heightRangeFrom: z.number().optional(),
    heightRangeTo: z.number().optional(),
    minFlightAlt: z.number().optional(),
    maxFlightAlt: z.number().optional(),
    geographicArea: z.string().optional(),
    productBoundingBox: z.string(),
    sensors: z.array(z.string()).min(INGESTION_VALIDATIONS.sensors.minItems),
  })
  .strict()
  .refine((data) => data.imagingTimeBeginUTC <= data.imagingTimeEndUTC, {
    message: 'imagingTimeBeginUTC must not be later than imagingTimeEndUTC',
    path: ['imagingTimeBeginUTC'],
  });
