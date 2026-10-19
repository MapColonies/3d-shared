import { z } from 'zod';
import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../../constants/ingestion/shapeMetadata';
import type { ShapeMetadataCommon, ShapeMetadataRow } from '../../types/ingestion/shapeMetadata';

const FIELDS = SHAPE_METADATA_FIELDS;

const MESSAGES = {
  text: 'must be text or a number',
  number: 'must be a number',
  date: 'must be a valid date',
  list: 'must contain at least one value',
} as const;

const emptyToUndefined = (value: unknown): unknown => (value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value);

const text = z.union([z.string(), z.number()], { errorMap: () => ({ message: MESSAGES.text }) }).transform((value) => String(value).trim());

const number = z.number({ errorMap: () => ({ message: MESSAGES.number }) }).finite(MESSAGES.number);

const dateFromParts = z
  .object({ year: z.number().int(), month: z.number().int(), day: z.number().int() })
  .transform(({ year, month, day }) => new Date(Date.UTC(year, month - 1, day)));

const dateFromString = z.string().transform((value) => new Date(value));

const date = z
  .union([dateFromParts, dateFromString], { errorMap: () => ({ message: MESSAGES.date }) })
  .refine((value) => !Number.isNaN(value.getTime()), MESSAGES.date);

const list = z
  .string({ errorMap: () => ({ message: MESSAGES.list }) })
  .transform((value) =>
    value
      .split(SHAPE_METADATA_LIST_SEPARATOR)
      .map((item) => item.trim())
      .filter((item) => item !== '')
  )
  .refine((items) => items.length > 0, MESSAGES.list);

const required = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T, z.output<T>, unknown> => z.preprocess(emptyToUndefined, schema);

const optional = <T extends z.ZodTypeAny>(schema: T): z.ZodEffects<z.ZodOptional<T>, z.output<T> | undefined, unknown> =>
  z.preprocess(emptyToUndefined, schema.optional());

const commonShape = {
  [FIELDS.prodID]: required(text),
  [FIELDS.prodName]: required(text),
  [FIELDS.srsId]: required(text),
  [FIELDS.srsName]: required(text),
  [FIELDS.producer]: required(text),
  [FIELDS.prodSys]: required(text),
  [FIELDS.prodVer]: required(text),
  [FIELDS.prodDate]: required(date),
};

const aggregatedShape = {
  [FIELDS.minResM]: required(number),
  [FIELDS.maxResM]: required(number),
  [FIELDS.absCep90]: required(number),
  [FIELDS.absLep90]: required(number),
  [FIELDS.dateStart]: required(date),
  [FIELDS.dateEnd]: required(date),
  [FIELDS.sensors]: required(list),
  [FIELDS.absSep90]: optional(number),
  [FIELDS.relCep90]: optional(number),
  [FIELDS.relLep90]: optional(number),
  [FIELDS.relSep90]: optional(number),
};

const partShape = {
  [FIELDS.id]: optional(number),
  [FIELDS.prodType]: optional(text),
  [FIELDS.desc]: optional(text),
  [FIELDS.classify]: optional(text),
  [FIELDS.countries]: optional(list),
  [FIELDS.cities]: optional(list),
  [FIELDS.inliersAmt]: optional(number),
  [FIELDS.accAlg]: optional(text),
  [FIELDS.mean]: optional(number),
  [FIELDS.std]: optional(number),
};

const commonObject = z.object(commonShape);

const toCommon = (row: z.output<typeof commonObject>): ShapeMetadataCommon => ({
  productId: row.prodID,
  productName: row.prodName,
  srsId: row.srsId,
  srsName: row.srsName,
  producerName: row.producer,
  productionSystem: row.prodSys,
  productionSystemVersion: row.prodVer,
  productionDate: row.prodDate.toISOString(),
});

export const shapeMetadataCommonSchema = commonObject.transform(toCommon);

export const shapeMetadataRowSchema = z
  .object({ ...commonShape, ...aggregatedShape, ...partShape })
  .refine((row) => row.minResM <= row.maxResM, { path: [FIELDS.minResM], message: `must not be greater than ${FIELDS.maxResM}` })
  .refine((row) => row.dateStart <= row.dateEnd, { path: [FIELDS.dateStart], message: `must not be later than ${FIELDS.dateEnd}` })
  .transform((row): ShapeMetadataRow => ({
    common: toCommon(row),
    aggregated: {
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
    },
    part: {
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
    },
  }));
