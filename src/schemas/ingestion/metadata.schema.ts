import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { geometrySchema } from '../core/geo.schema';

const accuracySchema = z.number().min(INGESTION_VALIDATIONS.accuracy.min).max(INGESTION_VALIDATIONS.accuracy.max);
const absoluteAccuracySep90Schema = z
  .number()
  .min(INGESTION_VALIDATIONS.absoluteAccuracySep90.min)
  .max(INGESTION_VALIDATIONS.absoluteAccuracySep90.max);
const relativeAccuracySep90Schema = z
  .number()
  .min(INGESTION_VALIDATIONS.relativeAccuracySep90.min)
  .max(INGESTION_VALIDATIONS.relativeAccuracySep90.max);
const resolutionSchema = z.number().min(INGESTION_VALIDATIONS.resolutionMeter.min).max(INGESTION_VALIDATIONS.resolutionMeter.max);

export const new3DLayerMetadataSchema = z.object({
  productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  classification: z.string(),
  region: z.array(z.string()).min(INGESTION_VALIDATIONS.region.minItems),
});

// export const update3DLayerMetadataSchema = z.object({
//   productName: z.string().max(INGESTION_VALIDATIONS.productName.maxLength).optional(),
//   productSubType: z.string().optional(),
//   description: z.string().optional(),
//   classification: z.string().optional(),
// });

export const aggregation3DMetadataSchema = z
  .object({
    footprint: geometrySchema,
    imagingTimeBeginUTC: z.coerce.date(),
    imagingTimeEndUTC: z.coerce.date(),
    maxAbsoluteAccuracyCEP90: accuracySchema,
    maxAbsoluteAccuracyLEP90: accuracySchema,
    maxRelativeAccuracyCEP90: accuracySchema.optional(),
    maxRelativeAccuracyLEP90: accuracySchema.optional(),
    maxAbsoluteAccuracySEP90: absoluteAccuracySep90Schema.optional(),
    maxRelativeAccuracySEP90: relativeAccuracySep90Schema.optional(),
    visualAccuracy: accuracySchema.optional(),
    maxResolutionMeter: resolutionSchema,
    minResolutionMeter: resolutionSchema,
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
