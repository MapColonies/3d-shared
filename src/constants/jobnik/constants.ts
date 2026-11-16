export const JOB_TYPES = {
  ingestion: '3D-Ingestion',
  delete: '3D-Delete',
} as const;

export type JobType3D = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

export const STAGE_TYPES = {
  validateShapefiles: 'validate-shapefiles',
  extract3tz: 'extract-3tz',
  planUpload: 'plan-upload',
  uploadFiles: 'upload-files',
  deleteTempFiles: 'delete-temp-files',
  insertParts: 'insert-parts',
  insertRecord: 'insert-record',
  deleteModelFiles: 'delete-model-files',
  deleteParts: 'delete-parts',
  deleteRecord: 'delete-record',
} as const;

export type StageType3D = (typeof STAGE_TYPES)[keyof typeof STAGE_TYPES];

/* eslint-disable @typescript-eslint/naming-convention */
export const STORAGE_PROVIDERS = {
  FS: 'FS',
  S3: 'S3',
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

export type StorageProvider = (typeof STORAGE_PROVIDERS)[keyof typeof STORAGE_PROVIDERS];

export const PRODUCT_VERSION = 1;
