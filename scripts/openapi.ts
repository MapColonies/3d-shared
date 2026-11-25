import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { stringify } from 'yaml';
import { z } from 'zod';
import {
  catalogRecordMetadataSchema,
  catalogRecordSchema,
  catalogRecordStatusUpdateSchema,
  catalogRecordUpdateSchema,
  linkSchema,
  productTypeSchema,
  recordStatusSchema,
} from '../src/schemas/catalog';

extendZodWithOpenApi(z);

const CATALOG_RECORD_OPENAPI_PATH = join(__dirname, '..', 'openapi', 'catalogRecord.yaml');

const buildCatalogRecordOpenApi = (): string => {
  const registry = new OpenAPIRegistry();
  registry.register('productType', productTypeSchema);
  registry.register('recordStatus', recordStatusSchema);
  registry.register('link', linkSchema);
  registry.register('catalogRecordMetadata', catalogRecordMetadataSchema);
  registry.register('catalogRecord', catalogRecordSchema);
  registry.register('catalogRecordUpdate', catalogRecordUpdateSchema);
  registry.register('catalogRecordStatusUpdate', catalogRecordStatusUpdateSchema);

  const document = new OpenApiGeneratorV3(registry.definitions).generateComponents();

  return stringify(
    { openapi: '3.0.3', info: { title: '3D catalog record', version: '2.0.0' }, paths: {}, ...document },
    { aliasDuplicateObjects: false }
  );
};

if (require.main === module) {
  writeFileSync(CATALOG_RECORD_OPENAPI_PATH, buildCatalogRecordOpenApi());
}

export { CATALOG_RECORD_OPENAPI_PATH, buildCatalogRecordOpenApi };
