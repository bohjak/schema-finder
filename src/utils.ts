import {JSONSchema7} from "json-schema";
import {SchemaEntry} from "./internal";

export const id = <T>(x: T): T => x;
export const noop = () => {};

/**
 * Transforms key/schema entry into {SchemaEntry}
 */
export const toSchemaEntry = ([key, schema]: [
  key: string,
  value: JSONSchema7
]): SchemaEntry => ({
  key,
  schema,
  name: key,
});
