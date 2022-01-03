import {JSONSchema7} from "./internal";

/**
 * Type-safe wrapper for Array.prototype.includes
 *
 * When the array has specific values defined, argument to includes cannot be
 * a generic string (i.e. TS won't let it)
 */
const createMemberCheck =
  (arr: string[]) =>
  (key?: string): boolean =>
    !!key && arr.includes(key);

/**
 * Keywords we're currently capable of handling and displaying
 */
const supportedKeywords: (keyof JSONSchema7)[] = [
  "additionalItems",
  "additionalProperties",
  "allOf",
  "anyOf",
  "contains",
  "else",
  "if",
  "items",
  "not",
  "oneOf",
  "patternProperties",
  "properties",
  "propertyNames",
  "then",
];

export const isSupportedKeyword = createMemberCheck(supportedKeywords);
