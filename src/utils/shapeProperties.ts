interface ShapeDate {
  year: number;
  month: number;
  day: number;
}

const isShapeDate = (value: unknown): value is ShapeDate =>
  typeof value === 'object' &&
  value !== null &&
  'year' in value &&
  'month' in value &&
  'day' in value &&
  [value.year, value.month, value.day].every((part) => Number.isInteger(part));

export const isEmptyProperty = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

export const toUtcDate = (value: unknown): Date | undefined => {
  if (isShapeDate(value)) {
    const date = new Date(Date.UTC(value.year, value.month - 1, value.day));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};

export const toTrimmedString = (value: unknown): string => String(value).trim();

export const toStringList = (value: unknown, separator: string): string[] =>
  String(value)
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item !== '');

export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
