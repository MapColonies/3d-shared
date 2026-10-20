export const pickEnum = <T extends Record<string, string | number>, K extends keyof T>(enumObj: T, keys: readonly K[]): Pick<T, K> => {
  return keys.reduce(
    (acc, key) => {
      acc[key] = enumObj[key];
      return acc;
    },
    {} as Pick<T, K>
  );
};

export const isEmptyValue = (value: unknown): boolean => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
