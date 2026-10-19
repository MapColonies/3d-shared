import { SHAPE_METADATA_FIELDS, SHAPE_METADATA_LIST_SEPARATOR } from '../constants/ingestion/shapeMetadata';
import type {
  ShapeMetadataAggregated,
  ShapeMetadataCommon,
  ShapeMetadataPart,
  ShapeMetadataResult,
  ShapeMetadataRow,
} from '../types/ingestion/shapeMetadata';
import { isEmptyProperty, isFiniteNumber, toStringList, toTrimmedString, toUtcDate } from './shapeProperties';

type Properties = Record<string, unknown>;

const FIELDS = SHAPE_METADATA_FIELDS;
const COMMON_STRINGS = [FIELDS.prodID, FIELDS.prodName, FIELDS.srsId, FIELDS.srsName, FIELDS.producer, FIELDS.prodSys, FIELDS.prodVer] as const;
const MANDATORY_NUMBERS = [FIELDS.minResM, FIELDS.maxResM, FIELDS.absCep90, FIELDS.absLep90] as const;
const OPTIONAL_NUMBERS = [
  FIELDS.absSep90,
  FIELDS.relCep90,
  FIELDS.relLep90,
  FIELDS.relSep90,
  FIELDS.id,
  FIELDS.inliersAmt,
  FIELDS.mean,
  FIELDS.std,
] as const;
const MANDATORY_DATES = [FIELDS.dateStart, FIELDS.dateEnd] as const;

const missing = (properties: Properties, fields: readonly string[]): string[] =>
  fields.filter((field) => isEmptyProperty(properties[field])).map((field) => `ShapeMetadata: ${field} is mandatory`);

const invalidDates = (properties: Properties, fields: readonly string[]): string[] =>
  fields
    .filter((field) => !isEmptyProperty(properties[field]) && toUtcDate(properties[field]) === undefined)
    .map((field) => `ShapeMetadata: ${field} must be a valid date`);

const invalidNumbers = (properties: Properties, fields: readonly string[]): string[] =>
  fields
    .filter((field) => !isEmptyProperty(properties[field]) && !isFiniteNumber(properties[field]))
    .map((field) => `ShapeMetadata: ${field} must be a number`);

const optionalNumber = (properties: Properties, field: string): number | undefined => {
  const value = properties[field];
  return isFiniteNumber(value) ? value : undefined;
};

const optionalString = (properties: Properties, field: string): string | undefined =>
  isEmptyProperty(properties[field]) ? undefined : toTrimmedString(properties[field]);

const optionalList = (properties: Properties, field: string): string[] | undefined => {
  if (isEmptyProperty(properties[field])) {
    return undefined;
  }
  return toStringList(properties[field], SHAPE_METADATA_LIST_SEPARATOR);
};

const dateOf = (properties: Properties, field: string): Date => toUtcDate(properties[field]) as Date;

const numberOf = (properties: Properties, field: string): number => properties[field] as number;

const validateAggregated = (properties: Properties): string[] => {
  const errors = [
    ...missing(properties, [...MANDATORY_NUMBERS, ...MANDATORY_DATES, FIELDS.sensors]),
    ...invalidNumbers(properties, [...MANDATORY_NUMBERS, ...OPTIONAL_NUMBERS]),
    ...invalidDates(properties, MANDATORY_DATES),
  ];
  if (errors.length > 0) {
    return errors;
  }

  if (numberOf(properties, FIELDS.minResM) > numberOf(properties, FIELDS.maxResM)) {
    errors.push(`ShapeMetadata: ${FIELDS.minResM} must not be greater than ${FIELDS.maxResM}`);
  }
  if (dateOf(properties, FIELDS.dateStart) > dateOf(properties, FIELDS.dateEnd)) {
    errors.push(`ShapeMetadata: ${FIELDS.dateStart} must not be later than ${FIELDS.dateEnd}`);
  }
  return errors;
};

const toAggregated = (properties: Properties): ShapeMetadataAggregated => ({
  imagingTimeBeginUTC: dateOf(properties, FIELDS.dateStart),
  imagingTimeEndUTC: dateOf(properties, FIELDS.dateEnd),
  minResolutionMeter: numberOf(properties, FIELDS.minResM),
  maxResolutionMeter: numberOf(properties, FIELDS.maxResM),
  maxAbsoluteAccuracyCEP90: numberOf(properties, FIELDS.absCep90),
  maxAbsoluteAccuracyLEP90: numberOf(properties, FIELDS.absLep90),
  maxAbsoluteAccuracySEP90: optionalNumber(properties, FIELDS.absSep90),
  maxRelativeAccuracyCEP90: optionalNumber(properties, FIELDS.relCep90),
  maxRelativeAccuracyLEP90: optionalNumber(properties, FIELDS.relLep90),
  maxRelativeAccuracySEP90: optionalNumber(properties, FIELDS.relSep90),
  sensors: toStringList(properties[FIELDS.sensors], SHAPE_METADATA_LIST_SEPARATOR),
});

const toPart = (properties: Properties): ShapeMetadataPart => ({
  id: optionalNumber(properties, FIELDS.id),
  productType: optionalString(properties, FIELDS.prodType),
  description: optionalString(properties, FIELDS.desc),
  classification: optionalString(properties, FIELDS.classify),
  countries: optionalList(properties, FIELDS.countries),
  cities: optionalList(properties, FIELDS.cities),
  inliersAmt: optionalNumber(properties, FIELDS.inliersAmt),
  accAlg: optionalString(properties, FIELDS.accAlg),
  mean: optionalNumber(properties, FIELDS.mean),
  std: optionalNumber(properties, FIELDS.std),
});

export const extractCommonShapeMetadata = (properties: Properties): ShapeMetadataResult<ShapeMetadataCommon> => {
  const errors = [...missing(properties, [...COMMON_STRINGS, FIELDS.prodDate]), ...invalidDates(properties, [FIELDS.prodDate])];
  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      productId: toTrimmedString(properties[FIELDS.prodID]),
      productName: toTrimmedString(properties[FIELDS.prodName]),
      srsId: toTrimmedString(properties[FIELDS.srsId]),
      srsName: toTrimmedString(properties[FIELDS.srsName]),
      producerName: toTrimmedString(properties[FIELDS.producer]),
      productionSystem: toTrimmedString(properties[FIELDS.prodSys]),
      productionSystemVersion: toTrimmedString(properties[FIELDS.prodVer]),
      productionDate: dateOf(properties, FIELDS.prodDate).toISOString(),
    },
  };
};

export const extractShapeMetadataRow = (properties: Properties): ShapeMetadataResult<ShapeMetadataRow> => {
  const common = extractCommonShapeMetadata(properties);
  const errors = [...(common.success ? [] : common.errors), ...validateAggregated(properties)];
  if (!common.success || errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: { common: common.data, aggregated: toAggregated(properties), part: toPart(properties) } };
};
