import { RecordStatus, RecordType } from '@map-colonies/types';
import { z } from 'zod';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { geometrySchema } from '../core';

const PRODUCTION_SYSTEM_VERSION_MAX_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 500;

const range = ({ min, max }: { min: number; max: number }): z.ZodNumber => z.number().min(min).max(max);

const dateTimeSchema = z.string().datetime({ offset: true });

const textSchema = z.string().trim().min(1);

export const productTypeSchema = z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]).describe('Type of 3D product');

export const recordStatusSchema = z.nativeEnum(RecordStatus).describe('The status of the record');

export const linkSchema = z
  .object({
    name: z.string().nullish(),
    description: z.string().nullish(),
    protocol: textSchema,
    url: z.string().url(),
  })
  .strict();

export const catalogRecordMetadataSchema = z
  .object({
    productName: textSchema.max(INGESTION_VALIDATIONS.productName.maxLength).describe('Name of product'),
    productType: productTypeSchema,
    productSubType: z.string().nullish().describe('Sub-type of the product within the product type'),
    description: z.string().max(DESCRIPTION_MAX_LENGTH).nullish().describe('Description and comments'),
    imagingTimeBeginUTC: dateTimeSchema.describe('Oldest imaging date of the parts'),
    imagingTimeEndUTC: dateTimeSchema.describe('Newest imaging date of the parts'),
    minResolutionMeter: range(INGESTION_VALIDATIONS.resolutionMeter).describe('Minimum resolution in meters'),
    maxResolutionMeter: range(INGESTION_VALIDATIONS.resolutionMeter).describe('Maximum resolution in meters'),
    maxAbsoluteAccuracyCEP90: range(INGESTION_VALIDATIONS.accuracy).describe('Maximum absolute CEP90 horizontal accuracy'),
    maxAbsoluteAccuracyLEP90: range(INGESTION_VALIDATIONS.accuracy).describe('Maximum absolute LEP90 vertical accuracy'),
    maxAbsoluteAccuracySEP90: range(INGESTION_VALIDATIONS.absoluteAccuracySep90).nullish().describe('Maximum absolute SEP90 spherical accuracy'),
    maxRelativeAccuracyCEP90: range(INGESTION_VALIDATIONS.accuracy).nullish().describe('Maximum relative CEP90 horizontal accuracy'),
    maxRelativeAccuracyLEP90: range(INGESTION_VALIDATIONS.accuracy).nullish().describe('Maximum relative LEP90 vertical accuracy'),
    maxRelativeAccuracySEP90: range(INGESTION_VALIDATIONS.relativeAccuracySep90).nullish().describe('Maximum relative SEP90 spherical accuracy'),
    sensors: z.array(textSchema).min(INGESTION_VALIDATIONS.sensors.minItems).describe('Sensors used for the product'),
    footprint: geometrySchema.describe('Geographic demarcation of the product'),
    srsId: textSchema.describe('EPSG code of the reference system'),
    srsName: textSchema.describe('Name of the reference system'),
    region: z.array(textSchema).min(INGESTION_VALIDATIONS.region.minItems).describe('Regions included in the product'),
    classification: z.string().regex(new RegExp(INGESTION_VALIDATIONS.classification.pattern)).describe('Classification of the product'),
    productionSystem: textSchema.describe('Production system'),
    productionSystemVersion: textSchema.max(PRODUCTION_SYSTEM_VERSION_MAX_LENGTH).describe('Version of the production system'),
    productionDate: dateTimeSchema.describe('Production date of the product'),
    producerName: textSchema.describe('Name of the producer (product owner)'),
    keywords: z.string().nullish().describe('Keywords of the product'),
  })
  .strict();

export const catalogRecordSchema = catalogRecordMetadataSchema
  .extend({
    id: z.string().uuid().describe('Internal catalog id of the record'),
    type: z.literal(RecordType.RECORD_3D).describe('Type of record'),
    productId: textSchema.describe('External id of the product'),
    productVersion: z.number().int().min(1).describe('Version of the product'),
    productStatus: recordStatusSchema,
    creationDate: dateTimeSchema.describe('Date the record was added to the catalog'),
    updateDate: dateTimeSchema.describe('Date the record was last updated'),
    links: z.array(linkSchema).describe('Links of the product'),
  })
  .strict();

export const catalogRecordUpdateSchema = catalogRecordMetadataSchema
  .pick({
    productName: true,
    productSubType: true,
    description: true,
    imagingTimeBeginUTC: true,
    imagingTimeEndUTC: true,
    footprint: true,
    minResolutionMeter: true,
    maxResolutionMeter: true,
    maxAbsoluteAccuracyCEP90: true,
    maxAbsoluteAccuracyLEP90: true,
    maxAbsoluteAccuracySEP90: true,
    maxRelativeAccuracyCEP90: true,
    maxRelativeAccuracyLEP90: true,
    maxRelativeAccuracySEP90: true,
    sensors: true,
    classification: true,
    producerName: true,
    keywords: true,
  })
  .partial()
  .strict();

export const catalogRecordStatusUpdateSchema = z.object({ productStatus: recordStatusSchema }).strict();
