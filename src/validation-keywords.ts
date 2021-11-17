import {JSONSchema7} from "json-schema";

const createMemberCheck =
  (arr: string[]) =>
  (key?: string): boolean =>
    !!key && arr.includes(key);

/**
 * Keywords we're currently capable of handling and displaying
 */
const supportedKeywords: (keyof JSONSchema7)[] = [
  "$ref",
  "additionalItems",
  "additionalProperties",
  "contains",
  "items",
  "patternProperties",
  "properties",
  "propertyNames",
];

export const isSupportedKeyword = createMemberCheck(supportedKeywords);

/*
export const schemaObjectKeys: (keyof JSONSchema7)[] = [
  "properties",
  "patternProperties",
  "dependencies",
];

export const isSchemaObject = createMemberCheck(schemaObjectKeys);

export const simpleKeys: (keyof JSONSchema7)[] = [
  "items",
  "additionalItems",
  "additionalProperties",
  "propertyNames",
  "contains",
  "if",
  "then",
  "else",
  "not",
];

export const isSimpleKey = createMemberCheck(simpleKeys);

export const schemaArrayKeys: (keyof JSONSchema7)[] = [
  "allOf",
  "anyOf",
  "oneOf",
];

export const isSchemaArray = createMemberCheck(schemaArrayKeys);

export const complexKeys = [...schemaObjectKeys, ...schemaArrayKeys];

export const isComplexKey = createMemberCheck(complexKeys);

export const validationKeywords: (keyof JSONSchema7)[] = [
  ...schemaObjectKeys,
  ...schemaArrayKeys,
  ...simpleKeys,
];

export const isValidationKeyword = createMemberCheck(validationKeywords);

export const canSkip = createMemberCheck([...schemaObjectKeys, ...simpleKeys]);
*/
