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

export const getNameFromRef = (ref?: string) => parseRef(ref)?.slice(-1)[0];
// .replace(matchWord, splitWithSpaces)
// .trim()
// .split(" ")
// .map(capFirstLetter)
// .join(" ");

export type DeepGet = (path?: string[]) => JSONSchema7 | undefined;

export const cleverDeepGet = (obj?: JSONSchema7) => {
  const deepGet: DeepGet = (path = []) => {
    let acc = obj;

    for (const key of path.slice(1)) {
      // @ts-expect-error Unsafe object manipulation
      acc = acc[key];

      if (acc && typeof acc === "object" && "$ref" in acc) {
        const {$ref} = acc;
        acc = {...acc, ...deepGet(parseRef($ref))};
      }
    }

    return acc;
  };

  return deepGet;
};

export const getColId = (idx: number) => `col-${idx}`;
