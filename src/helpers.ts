import type {JSONSchema7} from "json-schema";

export const getRef = (schema?: JSONSchema7) =>
  schema && typeof schema === "object" && "$ref" in schema
    ? schema.$ref
    : undefined;

export const parseRef = (ref?: string) => ref?.split("/");

const matchWord = /([A-Z-_]*[a-z]+)/g;
const splitWithSpaces = (m: string) => m.replace(/[-_]/, "") + " ";

const capFirstLetter = ([h, ...t]: string) => {
  h.toUpperCase() + t.join("").toLowerCase();
};

export const getNameFromRef = (ref?: string) =>
  parseRef(ref)
    ?.slice(-1)[0]
    .replace(matchWord, splitWithSpaces)
    .trim()
    .split(" ")
    .map(capFirstLetter)
    .join(" ");

export const cleverDeepGet = (obj: JSONSchema7) => {
  const deepGet = (path: string[] = []) => {
    let acc = obj;

    for (const key of path.slice(1)) {
      // @ts-expect-error Unsafe object manipulation
      acc = acc[key];

      if (acc && typeof acc === "object" && "$ref" in acc) {
        const {$ref, ...rest} = acc;
        acc = {...rest, ...deepGet(parseRef($ref))};
      }
    }

    return acc;
  };

  return deepGet;
};

const createMemberCheck =
  (arr: string[]) =>
  (key?: string): boolean =>
    !!key && arr.includes(key);

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

/** Only render these out in the tree (rest can be done in the Info window) */
export const validationKeywords: (keyof JSONSchema7)[] = [
  ...schemaObjectKeys,
  ...schemaArrayKeys,
  ...simpleKeys,
];

export const isValidationKeyword = createMemberCheck(validationKeywords);

export const canSkip = createMemberCheck([...schemaObjectKeys, ...simpleKeys]);
