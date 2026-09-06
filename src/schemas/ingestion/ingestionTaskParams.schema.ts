import { z } from 'zod';

export const ingestion3DNewFinalizeTaskParamsSchema = z.object({
  insertedToCatalog: z.boolean(),
});

export const ingestion3DUpdateFinalizeTaskParamsSchema = z.object({
  updatedInCatalog: z.boolean(),
});

export const ingestion3DDeleteTaskParamsSchema = z.object({
  deletedFromCatalog: z.boolean(),
});
