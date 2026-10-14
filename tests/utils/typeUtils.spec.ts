import { pickEnum } from '../../src/utils/typeUtils';

describe('pickEnum', () => {
  const source = { first: 'a', second: 'b', third: 'c' } as const;

  it('picks only the requested keys', () => {
    expect(pickEnum(source, ['first', 'third'])).toEqual({ first: 'a', third: 'c' });
  });

  it('returns an empty object when no keys are requested', () => {
    expect(pickEnum(source, [])).toEqual({});
  });

  it('preserves the original values', () => {
    const picked = pickEnum(source, ['second']);
    expect(picked.second).toBe('b');
  });
});
