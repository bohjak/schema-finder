import {JSONSchema7} from "json-schema";

export type SchemaEntry = {
  /** Key in parent schema */
  readonly key: string;
  /** Path through parent schemas */
  // readonly path: string[];
  /** Display name */
  readonly name: string;
  /** Schema value */
  readonly schema: JSONSchema7;
};
