import { z } from 'zod';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../constants/core';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../../constants/ingestion/shapeMetadata';
import { isEmptyValue } from '../../utils/typeUtils';

const FIELDS = SHAPE_METADATA_FIELDS;
const CLASSIFICATION_PATTERN = new RegExp(INGESTION_VALIDATIONS.classification.pattern);

const MESSAGES = {
  text: 'must be text or a number',
  number: 'must be a number',
  date: 'must be a valid date',
  list: 'must contain at least one value',
  classification: 'must contain only letters and digits',
} as const;

const emptyToUndefined = (value: unknown): unknown => (isEmptyValue(value) ? undefined : value);

const text = z.union([z.string(), z.number()], { errorMap: () => ({ message: MESSAGES.text }) }).transform((value) => String(value).trim());

const number = z.number({ errorMap: () => ({ message: MESSAGES.number }) }).finite(MESSAGES.number);

const range = ({ min, max }: { min: number; max: number }): z.ZodNumber =>
  number.min(min, `must be between ${min} and ${max}`).max(max, `must be between ${min} and ${max}`);

const resolution = range(INGESTION_VALIDATIONS.resolutionMeter);
const accuracy = range(INGESTION_VALIDATIONS.accuracy);

const productName = text.refine(
  (value) => value.length <= INGESTION_VALIDATIONS.productName.maxLength,
  `must be at most ${INGESTION_VALIDATIONS.productName.maxLength} characters`
);

const classification = text.refine((value) => CLASSIFICATION_PATTERN.test(value), MESSAGES.classification);

const productType = text.pipe(z.enum(LAYER_3D_PRODUCT_TYPE_LIST as [string, ...string[]]));

const dateFromParts = z
  .object({ year: z.number().int(), month: z.number().int(), day: z.number().int() })
  .transform(({ year, month, day }) => new Date(Date.UTC(year, month - 1, day)));

const dateFromString = z.string().transform((value) => new Date(value));

const date = z
  .union([dateFromParts, dateFromString], { errorMap: () => ({ message: MESSAGES.date }) })
  .refine((value) => !Number.isNaN(value.getTime()), MESSAGES.date);

const list = (minItems: number): z.ZodEffects<z.ZodEffects<z.ZodString, string[], string>, string[], string> =>
  z
    .string({ errorMap: () => ({ message: MESSAGES.list }) })
    .transform((value) =>
      value
        .split(SHAPE_METADATA_LIST_SEPARATOR)
        .map((item) => item.trim())
        .filter((item) => item !== '')
    )
    .refine((items) => items.length >= minItems, MESSAGES.list);

const sensors = list(INGESTION_VALIDATIONS.sensors.minItems);
const regions = list(INGESTION_VALIDATIONS.region.minItems);

const required = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T, z.output<T>, unknown> => z.preprocess(emptyToUndefined, schema);

const optional = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<z.ZodOptional<T>, z.output<T> | undefined, unknown> =>
  z.preprocess(emptyToUndefined, schema.optional());

const commonShape = {
  [FIELDS.prodID]: required(text),
  [FIELDS.prodName]: required(productName),
  [FIELDS.srsId]: required(text),
  [FIELDS.srsName]: required(text),
  [FIELDS.producer]: required(text),
  [FIELDS.prodSys]: required(text),
  [FIELDS.prodVer]: required(text),
  [FIELDS.prodDate]: required(date),
};

const aggregatedShape = {
  [FIELDS.minResM]: required(resolution),
  [FIELDS.maxResM]: required(resolution),
  [FIELDS.absCep90]: required(accuracy),
  [FIELDS.absLep90]: required(accuracy),
  [FIELDS.dateStart]: required(date),
  [FIELDS.dateEnd]: required(date),
  [FIELDS.sensors]: required(sensors),
  [FIELDS.absSep90]: optional(accuracy),
  [FIELDS.relCep90]: optional(accuracy),
  [FIELDS.relLep90]: optional(accuracy),
  [FIELDS.relSep90]: optional(accuracy),
};

const partShape = {
  [FIELDS.id]: optional(number),
  [FIELDS.prodType]: optional(productType),
  [FIELDS.desc]: optional(text),
  [FIELDS.classify]: optional(classification),
  [FIELDS.countries]: optional(regions),
  [FIELDS.cities]: optional(regions),
  [FIELDS.inliersAmt]: optional(number),
  [FIELDS.accAlg]: optional(text),
  [FIELDS.mean]: optional(number),
  [FIELDS.std]: optional(number),
};

export const shapeMetadataCommonSchema = z.object(commonShape).transform((row) => ({
  productId: row.prodID,
  productName: row.prodName,
  srsId: row.srsId,
  srsName: row.srsName,
  producerName: row.producer,
  productionSystem: row.prodSys,
  productionSystemVersion: row.prodVer,
  productionDate: row.prodDate.toISOString(),
}));

export const shapeMetadataAggregatedSchema = z
  .object(aggregatedShape)
  .refine((row) => row.minResM <= row.maxResM, { path: [FIELDS.minResM], message: `must not be greater than ${FIELDS.maxResM}` })
  .refine((row) => row.dateStart <= row.dateEnd, { path: [FIELDS.dateStart], message: `must not be later than ${FIELDS.dateEnd}` })
  .transform((row) => ({
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
  }));

export const shapeMetadataPartSchema = z.object(partShape).transform((row) => ({
  id: row.id,
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

export const shapeMetadataRowSchema = z.preprocess(
  (properties) => ({ common: properties, aggregated: properties, part: properties }),
  z.object({ common: shapeMetadataCommonSchema, aggregated: shapeMetadataAggregatedSchema, part: shapeMetadataPartSchema })
);
