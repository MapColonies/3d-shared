import { describe, it, expect } from 'vitest';
import { simplifyWhitespace } from '../../src/utils/text';

describe('simplifyWhitespace', () => {
  it.each([
    ['afula', 'afula'],
    ['  afula  north ', 'afula north'],
    ['    aaa    ffgf dsv  dsv      r    ', 'aaa ffgf dsv dsv r'],
    ['afula\tnorth', 'afula\tnorth'],
  ])('should simplify the whitespace of %o', (value, simplified) => {
    expect(simplifyWhitespace(value)).toBe(simplified);
  });
});
