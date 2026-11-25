export const INGESTION_VALIDATIONS = {
  productId: {
    pattern: '^[A-Za-z]{1}[A-Za-z0-9_]{0,36}$',
    description: 'Product ID must start with a letter and contain only letters, numbers and underscores',
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
  absoluteAccuracySep90: {
    min: 0,
    max: 250,
  },
  relativeAccuracySep90: {
    min: 0,
    max: 100,
  },
  sensors: {
    minItems: 1,
  },
  region: {
    minItems: 1,
  },
} as const;
