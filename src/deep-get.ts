import {JSONSchema7} from "json-schema";
import {parseRef} from "./internal";

export type DeepGet = (path?: string[]) => JSONSchema7 | undefined;

export const deepGet = (obj?: JSONSchema7) => {
  const deepGet: DeepGet = (path = []) => {
    let acc = obj;

    for (const key of path) {
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
