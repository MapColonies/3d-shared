import { z } from 'zod';

export const createJobResponseSchema = z.object({
  id: z.string().uuid(),
  taskIds: z.array(z.string().uuid()),
  status: z.string(),
});
