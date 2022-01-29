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

/**
 * Keywords that act on their parent nodes
 */
const retroactiveKeywords: (keyof JSONSchema7)[] = ["anyOf", "oneOf", "allOf"];

export const isRetroKeyword = createMemberCheck(retroactiveKeywords);

const jsonSchemaKeywords: (keyof JSONSchema7)[] = [
  "$comment",
  "$id",
  "$ref",
  "$schema",
  "additionalItems",
  "additionalProperties",
  "allOf",
  "anyOf",
  "const",
  "contains",
  "contentEncoding",
  "contentMediaType",
  "default",
  "definitions",
  "dependencies",
  "description",
  "else",
  "enum",
  "examples",
  "exclusiveMaximum",
  "exclusiveMinimum",
  "format",
  "if",
  "items",
  "maxItems",
  "maxLength",
  "maxProperties",
  "maximum",
  "minItems",
  "minLength",
  "minProperties",
  "minimum",
  "multipleOf",
  "not",
  "oneOf",
  "pattern",
  "patternProperties",
  "properties",
  "propertyNames",
  "readOnly",
  "required",
  "then",
  "title",
  "type",
  "uniqueItems",
  "writeOnly",
];

// TODO: use binsearch
export const isJsonSchemaKeyword = createMemberCheck(jsonSchemaKeywords);
