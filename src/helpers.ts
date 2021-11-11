import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

type Property = [key: string, value: JSONSchema7Definition];

const getTitle = (def?: JSONSchema7): string | undefined => {
  return def?.title;
};

const getPropName = ([key, value]: Property): string => {
  if (typeof value === 'boolean') return key;

  return getTitle(value) ?? key;
};

export const getPropNames = (schema: JSONSchema7): string[] => {
  const props = schema.properties;

  if (!props) return [];

  return Object.entries(props).map(getPropName);
};

export const getDefinition =
  (definitions?: Record<string, JSONSchema7Definition>) => (key: string) =>
    definitions?.[key];

export const deepGet = (obj: Record<string, unknown>) => (path: string[]) =>
  // @ts-expect-error unsafe object access
  path.reduce((acc, key) => acc[key], obj);

export const parseRef = (ref?: string) => ref?.substring(2).split('/');

export const cleverDeepGet =
  (obj: JSONSchema7) =>
  (path: string[] = []) => {
    let acc = obj;

    for (const key of path) {
      if (key === 'root') continue;
      // @ts-expect-error unsafe object access
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
