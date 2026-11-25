import { posix, win32 } from 'node:path';
import { z } from 'zod';
import { INGESTION_VALIDATIONS } from '../../constants/ingestion';
import { isEpsgCode } from '../../utils/epsg';
import { simplifyWhitespace } from '../../utils/text';

const PARENT_SEGMENT = '..';
const DRIVE_PREFIX = /^[a-zA-Z]:/;

export const relativePathSchema = z
  .string()
  .refine((path) => path.trim().length > 0, { message: 'must not be blank' })
  .refine((path) => !posix.isAbsolute(path) && !win32.isAbsolute(path) && !DRIVE_PREFIX.test(path), {
    message: 'must be relative to the share base path',
  })
  .refine((path) => !path.split(/[\\/]/).includes(PARENT_SEGMENT), { message: `must not contain "${PARENT_SEGMENT}" segments` });

export const modelIdSchema = z.string().uuid();

export const productIdSchema = z
  .string()
  .trim()
  .regex(new RegExp(INGESTION_VALIDATIONS.productId.pattern), { message: INGESTION_VALIDATIONS.productId.description });

export const productNameSchema = z.string().transform(simplifyWhitespace).pipe(z.string().min(1).max(INGESTION_VALIDATIONS.productName.maxLength));

export const srsIdSchema = z.string().trim().refine(isEpsgCode, { message: 'must be a valid EPSG code' });
