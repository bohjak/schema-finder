import type { JSONSchema7 } from 'json-schema';

export const parseRef = (ref?: string) => ref?.split('/');

export const cleverDeepGet =
  (obj: JSONSchema7) =>
  (path: string[] = []) => {
    let acc = obj;

    for (const key of path.slice(1)) {
      // @ts-expect-error Unsafe object manipulation
      acc = acc[key];

      if (acc && typeof acc === 'object' && '$ref' in acc) {
        const { $ref, ...rest } = acc;
        acc = { ...rest, ...cleverDeepGet(obj)(parseRef($ref)) };
      }
    }

    return acc;
  };

const createMemberCheck =
  (arr: string[]) =>
  (key?: string): boolean =>
    !!key && arr.includes(key);

export const schemaObjectKeys: (keyof JSONSchema7)[] = [
  'properties',
  'patternProperties',
  'dependencies',
];

export const isSchemaObject = createMemberCheck(schemaObjectKeys);

export const simpleKeys: (keyof JSONSchema7)[] = [
  'items',
  'contains',
  'additionalItems',
  'additionalProperties',
  'propertyNames',
  'if',
  'then',
  'else',
  'not',
];

export const isSimpleKey = createMemberCheck(simpleKeys);

export const schemaArrayKeys: (keyof JSONSchema7)[] = [
  'allOf',
  'anyOf',
  'oneOf',
];

export const isSchemaArray = createMemberCheck(schemaArrayKeys);

export const complexKeys = [...schemaObjectKeys, ...schemaArrayKeys];

export const isComplexKey = createMemberCheck(complexKeys);

/** Only render these out in the tree (rest can be done in the Info window) */
export const validationKeywords: (keyof JSONSchema7)[] = [
  ...schemaObjectKeys,
  ...schemaArrayKeys,
  ...simpleKeys,
];

export const isValidationKeyword = createMemberCheck(validationKeywords);

export const canSkip = createMemberCheck([...schemaObjectKeys, ...simpleKeys]);
