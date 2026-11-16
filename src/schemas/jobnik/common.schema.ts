import { posix, win32 } from 'node:path';
import { z } from 'zod';

const PARENT_SEGMENT = '..';

export const relativePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine((path) => !posix.isAbsolute(path) && !win32.isAbsolute(path), { message: 'must be relative to the share base path' })
  .refine((path) => !path.split(/[\\/]/).includes(PARENT_SEGMENT), { message: `must not contain "${PARENT_SEGMENT}" segments` });

export const modelIdSchema = z.string().uuid();
