import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../../constants/ingestion/shapeMetadata';

const FIELDS = SHAPE_METADATA_FIELDS;
const CLASSIFICATION_PATTERN = new RegExp(INGESTION_VALIDATIONS.classification.pattern);

const MESSAGES = {
  mandatory: 'is mandatory',
  text: 'must be text or a number',
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

const numberToString = (value: unknown): unknown => (typeof value === 'number' ? String(value) : value);

const trimmedText = z.string({ errorMap: errorMap(MESSAGES.text) }).trim();

const text = z.preprocess(numberToString, trimmedText.min(1, MESSAGES.mandatory));

const number = z.number({ errorMap: errorMap(MESSAGES.number) }).finite(MESSAGES.number);

const range = ({ min, max }: { min: number; max: number }): z.ZodNumber =>
  number.min(min, `must be between ${min} and ${max}`).max(max, `must be between ${min} and ${max}`);

const resolution = range(INGESTION_VALIDATIONS.resolutionMeter);
const accuracy = range(INGESTION_VALIDATIONS.accuracy);
const absoluteAccuracySep90 = range(INGESTION_VALIDATIONS.absoluteAccuracySep90);
const relativeAccuracySep90 = range(INGESTION_VALIDATIONS.relativeAccuracySep90);

const productName = z.preprocess(
  numberToString,
  trimmedText
    .min(1, MESSAGES.mandatory)
    .max(INGESTION_VALIDATIONS.productName.maxLength, `must be at most ${INGESTION_VALIDATIONS.productName.maxLength} characters`)
);

const classification = z.preprocess(numberToString, trimmedText.regex(CLASSIFICATION_PATTERN, MESSAGES.classification));

const productType = z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]], {
  errorMap: errorMap(`must be one of: ${LAYER_3D_PRODUCT_TYPE_LIST.join(', ')}`),
});

const date = z.preprocess(
  (value) => {
    if (typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'day' in value) {
      return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day)));
    }
    return typeof value === 'string' ? new Date(value) : value;
  },
  z.date({ errorMap: errorMap(MESSAGES.date) })
);

const list = (minItems: number): z.ZodEffects<z.ZodEffects<z.ZodString, string[], string>, string[], string> =>
  z
    .string({ errorMap: errorMap(MESSAGES.list) })
    .transform((value) =>
      value
        .split(SHAPE_METADATA_LIST_SEPARATOR)
        .map((item) => item.trim())
        .filter((item) => item !== '')
    )
    .refine((items) => items.length >= minItems, MESSAGES.list);

const sensors = list(INGESTION_VALIDATIONS.sensors.minItems);
const regions = list(INGESTION_VALIDATIONS.region.minItems);

export const shapeMetadataRowSchema = z
  .object({
    [FIELDS.prodID]: text,
    [FIELDS.prodName]: productName,
    [FIELDS.srsId]: text,
    [FIELDS.srsName]: text,
    [FIELDS.producer]: text,
    [FIELDS.prodSys]: text,
    [FIELDS.prodVer]: text,
    [FIELDS.prodDate]: date,
    [FIELDS.dateStart]: date,
    [FIELDS.dateEnd]: date,
    [FIELDS.minResM]: resolution,
    [FIELDS.maxResM]: resolution,
    [FIELDS.absCep90]: accuracy,
    [FIELDS.absLep90]: accuracy,
    [FIELDS.sensors]: sensors,
    [FIELDS.id]: number,
    [FIELDS.prodType]: productType,
    [FIELDS.classify]: classification,
    [FIELDS.countries]: regions,
    [FIELDS.absSep90]: optional(absoluteAccuracySep90),
    [FIELDS.relCep90]: optional(accuracy),
    [FIELDS.relLep90]: optional(accuracy),
    [FIELDS.relSep90]: optional(relativeAccuracySep90),
    [FIELDS.desc]: optional(text),
    [FIELDS.cities]: optional(regions),
    [FIELDS.inliersAmt]: optional(number),
    [FIELDS.accAlg]: optional(text),
    [FIELDS.mean]: optional(number),
    [FIELDS.std]: optional(number),
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
