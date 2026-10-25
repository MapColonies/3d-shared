import { z } from 'zod';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../../constants/ingestion/shapeMetadata';
import {
  MESSAGES,
  errorMap,
  numberSchema,
  resolutionMeterSchema,
  accuracySchema,
  absoluteAccuracySep90Schema,
  relativeAccuracySep90Schema,
} from './common.schema';

const FIELDS = SHAPE_METADATA_FIELDS;

const blankToUndefined = (value: unknown): unknown => (value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value);

const optional = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<z.ZodOptional<T>, z.output<T> | undefined, unknown> =>
  z.preprocess(blankToUndefined, schema.optional());

const trimmedTextSchema = z.string({ errorMap: errorMap(MESSAGES.text) }).trim();

const textSchema = trimmedTextSchema.min(1, MESSAGES.mandatory);

const productNameSchema = trimmedTextSchema
  .min(1, MESSAGES.mandatory)
  .max(INGESTION_VALIDATIONS.productName.maxLength, `must be at most ${INGESTION_VALIDATIONS.productName.maxLength} characters`);

const dateSchema = z.preprocess(
  (value) => {
    if (typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'day' in value) {
      const [year, month, day] = [Number(value.year), Number(value.month), Number(value.day)];
      const date = new Date(Date.UTC(year, month - 1, day));
      const isRealDay = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
      return isRealDay ? date : new Date(Number.NaN);
    }
    return typeof value === 'string' ? new Date(value) : value;
  },
  z.date({ errorMap: errorMap(MESSAGES.date) })
);

const listSchema = (minItems: number): z.ZodEffects<z.ZodEffects<z.ZodString, string[], string>, string[], string> =>
  z
    .string({ errorMap: errorMap(MESSAGES.list) })
    .transform((value) => [
      ...new Set(
        value
          .split(SHAPE_METADATA_LIST_SEPARATOR)
          .map((item) => item.trim())
          .filter((item) => item !== '')
      ),
    ])
    .refine((items) => items.length >= minItems, MESSAGES.list);

const sensorsSchema = listSchema(INGESTION_VALIDATIONS.sensors.minItems);
const regionsSchema = listSchema(INGESTION_VALIDATIONS.region.minItems);

export const shapeMetadataRowSchema = z
  .object({
    [FIELDS.prodID]: textSchema,
    [FIELDS.prodName]: productNameSchema,
    [FIELDS.srsId]: textSchema,
    [FIELDS.srsName]: textSchema,
    [FIELDS.producer]: textSchema,
    [FIELDS.prodSys]: textSchema,
    [FIELDS.prodVer]: textSchema,
    [FIELDS.prodDate]: dateSchema,
    [FIELDS.dateStart]: dateSchema,
    [FIELDS.dateEnd]: dateSchema,
    [FIELDS.minResM]: resolutionMeterSchema,
    [FIELDS.maxResM]: resolutionMeterSchema,
    [FIELDS.absCep90]: accuracySchema,
    [FIELDS.absLep90]: accuracySchema,
    [FIELDS.sensors]: sensorsSchema,
    [FIELDS.id]: numberSchema.int(MESSAGES.integer).nonnegative(MESSAGES.integer),
    [FIELDS.countries]: regionsSchema,
    [FIELDS.absSep90]: optional(absoluteAccuracySep90Schema),
    [FIELDS.relCep90]: optional(accuracySchema),
    [FIELDS.relLep90]: optional(accuracySchema),
    [FIELDS.relSep90]: optional(relativeAccuracySep90Schema),
    [FIELDS.desc]: optional(textSchema),
    [FIELDS.cities]: optional(regionsSchema),
    [FIELDS.inliersAmt]: optional(numberSchema),
    [FIELDS.accAlg]: optional(textSchema),
    [FIELDS.mean]: optional(numberSchema),
    [FIELDS.std]: optional(numberSchema),
  })
  .refine((row) => row.minResM <= row.maxResM, { path: [FIELDS.minResM], message: `must not be greater than ${FIELDS.maxResM}` })
  .refine((row) => row.dateStart <= row.dateEnd, { path: [FIELDS.dateStart], message: `must not be later than ${FIELDS.dateEnd}` })
  .refine((row) => row.dateEnd <= new Date(), { path: [FIELDS.dateEnd], message: 'must not be in the future' })
  .transform((row) => ({
    productId: row.prodID,
    productName: row.prodName,
    srsId: row.srsId,
    srsName: row.srsName,
    producerName: row.producer,
    productionSystem: row.prodSys,
    productionSystemVersion: row.prodVer,
    productionDate: row.prodDate.toISOString(),
    imagingTimeBeginUTC: row.dateStart,
    imagingTimeEndUTC: row.dateEnd,
    minResolutionMeter: row.minResM,
    maxResolutionMeter: row.maxResM,
    maxAbsoluteAccuracyCEP90: row.absCep90,
    maxAbsoluteAccuracyLEP90: row.absLep90,
    maxAbsoluteAccuracySEP90: row.absSep90,
    maxRelativeAccuracyCEP90: row.relCep90,
    maxRelativeAccuracyLEP90: row.relLep90,
    maxRelativeAccuracySEP90: row.relSep90,
    sensors: row.sensors,
    partId: row.id,
    description: row.desc,
    countries: row.countries,
    cities: row.cities,
    inliersAmt: row.inliersAmt,
    accAlg: row.accAlg,
    mean: row.mean,
    std: row.std,
  }));
