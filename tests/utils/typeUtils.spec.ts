import { describe, it, expect } from 'vitest';
import { pickEnum } from '../../src/utils/typeUtils';

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
