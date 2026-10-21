import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../../constants/ingestion/shapeMetadata';

const FIELDS = SHAPE_METADATA_FIELDS;
const CLASSIFICATION_PATTERN = new RegExp(INGESTION_VALIDATIONS.classification.pattern);

const MESSAGES = {
  mandatory: 'is mandatory',
  text: 'must be text',
  number: 'must be a number',
  date: 'must be a valid date',
  list: 'must contain at least one value',
  classification: 'must contain only letters and digits',
} as const;

const errorMap =
  (message: string): z.ZodErrorMap =>
  (issue) => ({
    message:
      issue.code === z.ZodIssueCode.invalid_type && (issue.received === 'undefined' || issue.received === 'null') ? MESSAGES.mandatory : message,
  });

const blankToUndefined = (value: unknown): unknown => (value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value);

const optional = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<z.ZodOptional<T>, z.output<T> | undefined, unknown> =>
  z.preprocess(blankToUndefined, schema.optional());

const trimmedTextSchema = z.string({ errorMap: errorMap(MESSAGES.text) }).trim();

const textSchema = trimmedTextSchema.min(1, MESSAGES.mandatory);

const numberSchema = z.number({ errorMap: errorMap(MESSAGES.number) }).finite(MESSAGES.number);

const rangeSchema = ({ min, max }: { min: number; max: number }): z.ZodNumber =>
  numberSchema.min(min, `must be between ${min} and ${max}`).max(max, `must be between ${min} and ${max}`);

const resolutionSchema = rangeSchema(INGESTION_VALIDATIONS.resolutionMeter);
const accuracySchema = rangeSchema(INGESTION_VALIDATIONS.accuracy);
const absoluteAccuracySep90Schema = rangeSchema(INGESTION_VALIDATIONS.absoluteAccuracySep90);
const relativeAccuracySep90Schema = rangeSchema(INGESTION_VALIDATIONS.relativeAccuracySep90);

const productNameSchema = trimmedTextSchema
  .min(1, MESSAGES.mandatory)
  .max(INGESTION_VALIDATIONS.productName.maxLength, `must be at most ${INGESTION_VALIDATIONS.productName.maxLength} characters`);

const classificationSchema = trimmedTextSchema.regex(CLASSIFICATION_PATTERN, MESSAGES.classification);

const productTypeSchema = z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]], {
  errorMap: errorMap(`must be one of: ${LAYER_3D_PRODUCT_TYPE_LIST.join(', ')}`),
});

const dateSchema = z.preprocess(
  (value) => {
    if (typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'day' in value) {
      return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day)));
    }
    return typeof value === 'string' ? new Date(value) : value;
  },
  z.date({ errorMap: errorMap(MESSAGES.date) })
);

const listSchema = (minItems: number): z.ZodEffects<z.ZodEffects<z.ZodString, string[], string>, string[], string> =>
  z
    .string({ errorMap: errorMap(MESSAGES.list) })
    .transform((value) =>
      value
        .split(SHAPE_METADATA_LIST_SEPARATOR)
        .map((item) => item.trim())
        .filter((item) => item !== '')
    )
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
    [FIELDS.minResM]: resolutionSchema,
    [FIELDS.maxResM]: resolutionSchema,
    [FIELDS.absCep90]: accuracySchema,
    [FIELDS.absLep90]: accuracySchema,
    [FIELDS.sensors]: sensorsSchema,
    [FIELDS.id]: numberSchema,
    [FIELDS.prodType]: productTypeSchema,
    [FIELDS.classify]: classificationSchema,
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
    productType: row.prodType,
    description: row.desc,
    classification: row.classify,
    countries: row.countries,
    cities: row.cities,
    inliersAmt: row.inliersAmt,
    accAlg: row.accAlg,
    mean: row.mean,
    std: row.std,
  }));
