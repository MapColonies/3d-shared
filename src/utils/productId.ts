export const simplifyWhitespace = (value: string): string => value.replace(/\s\s+/g, ' ').trim();

export const toProductId = (prodID: string): string => simplifyWhitespace(prodID);
