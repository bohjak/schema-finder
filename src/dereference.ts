import {isObject, JSONSchema7, parseRef, R} from "./internal";

type DeepGet = (path?: string[]) => R<unknown>;
/**
 * Checks for $ref properties and if present, finds the referenced schema
 * and merges it with the referencing object
 */
export type Deref = (x: unknown) => R<unknown>;

export const makeDeref = (refSchema?: JSONSchema7) => {
  const deepGet: DeepGet = (path = []) => {
    let prev: unknown = refSchema;

    for (const key of path) {
      if (!isObject(prev))
        return [
          prev,
          new Error(`Incorrect path: cannot access key '${key}' on '${prev}'`),
        ];

      const [val, err] = deref(prev?.[key]);
      if (err) {
        console.error(
          `Couldn't dereference key '${key}' in path '${path.join(".")}'`,
          err
        );
      }

      prev = val;
    }

    return [prev];
  };

  const deref: Deref = (x) => {
    if (!isObject(x))
      return [x, new TypeError(`Cannot dereference non object value '${x}'`)];

    if ("$ref" in x && typeof x.$ref === "string") {
      const [derefed, err] = deepGet(parseRef(x.$ref));
      if (err) {
        return [x, err];
      }
      if (!isObject(derefed)) {
        return [x, new Error(`Incorrect reference path: ${x.$ref}`)];
      }

      return [{...x, ...derefed}];
    }

    return [x];
  };

  return deref;
};
