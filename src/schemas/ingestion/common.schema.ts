import { z } from 'zod';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';

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

const numberSchema = z.number({ errorMap: errorMap(MESSAGES.number) }).finite(MESSAGES.number);

const rangeSchema = ({ min, max }: { min: number; max: number }): z.ZodNumber =>
  numberSchema.min(min, `must be between ${min} and ${max}`).max(max, `must be between ${min} and ${max}`);

const resolutionSchema = rangeSchema(INGESTION_VALIDATIONS.resolutionMeter);
const accuracySchema = rangeSchema(INGESTION_VALIDATIONS.accuracy);
const absoluteAccuracySep90Schema = rangeSchema(INGESTION_VALIDATIONS.absoluteAccuracySep90);
const relativeAccuracySep90Schema = rangeSchema(INGESTION_VALIDATIONS.relativeAccuracySep90);

export { MESSAGES, errorMap, numberSchema, resolutionSchema, accuracySchema, absoluteAccuracySep90Schema, relativeAccuracySep90Schema };
