import { describe, it, expect } from 'vitest';
import { isEpsgCode } from '../../src/utils/epsg';

describe('isEpsgCode', () => {
  it.each(['4326', '2039', '3857'])('should accept the EPSG code %o', (code) => {
    expect(isEpsgCode(code)).toBe(true);
  });

  it.each(['', 'EPSG:4326', '99999', 'abc', 'toString', '__proto__'])('should reject %o', (code) => {
    expect(isEpsgCode(code)).toBe(false);
  });
});
