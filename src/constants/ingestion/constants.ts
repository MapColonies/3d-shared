/* eslint-disable @typescript-eslint/naming-convention */
export const JobTypes = {
  INGESTION_NEW: 'Ingestion_New',
  INGESTION_UPDATE: 'Ingestion_Update',
  DELETE: 'Delete',
} as const;

export type JobTypes = (typeof JobTypes)[keyof typeof JobTypes];

export const TaskTypes = {
  INIT: 'init',
  FINALIZE: 'finalize',
} as const;

export type TaskTypes = (typeof TaskTypes)[keyof typeof TaskTypes];

export const INGESTION_VALIDATIONS = {
  productId: {
    pattern: '^[a-zA-Z0-9_-]+$',
  },
  productName: {
    maxLength: 120,
  },
  classification: {
    pattern: '^[a-zA-Z0-9]+$',
  },
  resolutionMeter: {
    min: 0.01,
    max: 8000,
  },
  accuracy: {
    min: 0,
    max: 999,
  },
  sensors: {
    minItems: 1,
  },
  region: {
    minItems: 1,
  },
  productionSystemVer: {
    maxLength: 20,
  },
} as const;
