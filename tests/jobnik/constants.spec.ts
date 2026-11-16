import { describe, it, expect } from 'vitest';
import { JOB_TYPES, STAGE_TYPES, STORAGE_PROVIDERS } from '../../src/constants/jobnik';

describe('jobnik constants', () => {
  it('should name the 3D jobs', () => {
    expect(JOB_TYPES).toEqual({ ingestion: '3D-Ingestion', delete: '3D-Delete' });
  });

  it('should define the 10 unique stage types', () => {
    expect(new Set(Object.values(STAGE_TYPES)).size).toBe(10);
  });

  it('should support the FS and S3 storage providers', () => {
    expect(Object.values(STORAGE_PROVIDERS)).toEqual(['FS', 'S3']);
  });
});
