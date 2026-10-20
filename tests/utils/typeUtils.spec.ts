import { describe, it, expect } from 'vitest';
import { isEmptyValue, pickEnum } from '../../src/utils/typeUtils';

describe('pickEnum', () => {
  const source = { first: 'a', second: 'b', third: 'c' } as const;

  it('should pick only the requested keys', () => {
    expect(pickEnum(source, ['first', 'third'])).toEqual({ first: 'a', third: 'c' });
  });

  it('should return an empty object when no keys are requested', () => {
    expect(pickEnum(source, [])).toEqual({});
  });

  it('should preserve the original values', () => {
    const picked = pickEnum(source, ['second']);

    expect(picked.second).toBe('b');
  });
});

describe('isEmptyValue', () => {
  it.each([undefined, null, '', '   '])('should treat %j as empty', (value) => {
    expect(isEmptyValue(value)).toBe(true);
  });

  it.each([0, 4326, false, 'AFL', { year: 2025, month: 7, day: 10 }])('should not treat %j as empty', (value) => {
    expect(isEmptyValue(value)).toBe(false);
  });
});
