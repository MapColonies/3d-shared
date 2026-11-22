import type { z } from 'zod';
import type {
  catalogRecordMetadataSchema,
  catalogRecordSchema,
  catalogRecordStatusUpdateSchema,
  catalogRecordUpdateSchema,
  linkSchema,
} from '../../schemas/catalog/record.schema';

export type CatalogRecordMetadata = z.infer<typeof catalogRecordMetadataSchema>;
export type CatalogRecord = z.infer<typeof catalogRecordSchema>;
export type CatalogRecordUpdate = z.infer<typeof catalogRecordUpdateSchema>;
export type CatalogRecordStatusUpdate = z.infer<typeof catalogRecordStatusUpdateSchema>;
export type CatalogLink = z.infer<typeof linkSchema>;
