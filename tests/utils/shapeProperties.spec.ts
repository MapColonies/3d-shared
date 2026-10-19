import { describe, it, expect } from 'vitest';
import { isEmptyProperty, isFiniteNumber, toStringList, toTrimmedString, toUtcDate } from '../../src/utils/shapeProperties';

describe('shapeProperties', () => {
  describe('isEmptyProperty', () => {
    it.each([undefined, null, '', '   '])('should treat %j as empty', (value) => {
      expect(isEmptyProperty(value)).toBe(true);
    });

    it.each([0, 4326, false, 'AFL', { year: 2025, month: 7, day: 10 }])('should not treat %j as empty', (value) => {
      expect(isEmptyProperty(value)).toBe(false);
    });
  });

  describe('toUtcDate', () => {
    it('should convert the year, month and day object of the shapefile reader', () => {
      expect(toUtcDate({ year: 2025, month: 7, day: 10 })?.toISOString()).toBe('2025-07-10T00:00:00.000Z');
    });

    it('should parse an ISO date string', () => {
      expect(toUtcDate('2025-07-10T00:00:00.000Z')?.toISOString()).toBe('2025-07-10T00:00:00.000Z');
    });

    it.each(['not a date', 20250710, null, undefined, { year: 2025, month: 7 }, { year: 2025.5, month: 7, day: 10 }])(
      'should return undefined for %j',
      (value) => {
        expect(toUtcDate(value)).toBeUndefined();
      }
    );
  });

  describe('toTrimmedString', () => {
    it('should trim text and stringify numbers', () => {
      expect(toTrimmedString(' AFL ')).toBe('AFL');
      expect(toTrimmedString(4326)).toBe('4326');
    });
  });

  describe('toStringList', () => {
    it('should split on the separator, trim and drop empty items', () => {
      expect(toStringList(' UAV, OTHER ,, ', ',')).toEqual(['UAV', 'OTHER']);
    });
  });

  describe('isFiniteNumber', () => {
    it('should accept finite numbers only', () => {
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(Number.NaN)).toBe(false);
      expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isFiniteNumber('1')).toBe(false);
    });
  });
});
