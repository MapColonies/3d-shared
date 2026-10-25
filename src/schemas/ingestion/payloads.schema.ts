import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';

export const ingestion3DPayloadSchema = z.object({
  productType: z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]),
  productSubType: z.string().optional(),
  description: z.string().optional(),
  classification: z.string().trim().regex(new RegExp(INGESTION_VALIDATIONS.classification.pattern)),
  region: z.array(z.string().trim().min(1)).min(INGESTION_VALIDATIONS.region.minItems),
});

// TODO: waiting for product
// export const update3DLayerMetadataSchema = z.object({
//   productName: z.string().max(INGESTION_VALIDATIONS.productName.maxLength).optional(),
//   productSubType: z.string().optional(),
//   description: z.string().optional(),
//   classification: z.string().optional(),
// });

// TODO: waiting for product
// export const aggregation3DMetadataSchema = z
//   .object({
//     footprint: geometrySchema,
//     imagingTimeBeginUTC: z.coerce.date(),
//     imagingTimeEndUTC: z.coerce.date(),
//     maxAbsoluteAccuracyCEP90: accuracySchema,
//     maxAbsoluteAccuracyLEP90: accuracySchema,
//     maxRelativeAccuracyCEP90: accuracySchema.optional(),
//     maxRelativeAccuracyLEP90: accuracySchema.optional(),
//     maxAbsoluteAccuracySEP90: absoluteAccuracySep90Schema.optional(),
//     maxRelativeAccuracySEP90: relativeAccuracySep90Schema.optional(),
//     visualAccuracy: accuracySchema.optional(),
//     maxResolutionMeter: resolutionMeterSchema,
//     minResolutionMeter: resolutionMeterSchema,
//     heightRangeFrom: z.number().optional(),
//     heightRangeTo: z.number().optional(),
//     minFlightAlt: z.number().optional(),
//     maxFlightAlt: z.number().optional(),
//     geographicArea: z.string().optional(),
//     productBoundingBox: z.string(),
//     sensors: z.array(z.string()).min(INGESTION_VALIDATIONS.sensors.minItems),
//   })
//   .strict()
//   .refine((data) => data.imagingTimeBeginUTC <= data.imagingTimeEndUTC, {
//     message: 'imagingTimeBeginUTC must not be later than imagingTimeEndUTC',
//     path: ['imagingTimeBeginUTC'],
//   });

// export const ingestion3DUpdateJobParamsSchema = z.object({
//   metadata: update3DLayerMetadataSchema,
// });

export const ingestion3DDeleteJobParamsSchema = z.object({
  productId: z.string().trim().min(1),
});
