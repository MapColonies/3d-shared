import { z } from 'zod';
import { modelIdSchema } from './common.schema';

export const jobDataSchema = z.object({
  modelId: modelIdSchema,
  productId: z.string().trim().min(1),
  productName: z.string().trim().min(1),
});

export const ingestionJobDataSchema = jobDataSchema;
export const deleteJobDataSchema = jobDataSchema;
