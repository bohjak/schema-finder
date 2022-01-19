import {Deref, JSONSchema7, SchemaEntry} from "./internal";

export const id = <T>(x: T): T => x;
export const noop = () => {};

export const isObject = (x: unknown): x is Record<string, unknown> =>
  !!(x && typeof x === "object");

/**
 * Transforms key/schema entry into {SchemaEntry}
 */
export function toSchemaEntry(
  [key, schema]: [key: string, value: JSONSchema7],
  deref: Deref
): Promise<SchemaEntry> {
  return Promise.resolve({
    key,
    schema,
    name: key,
    deref,
  });
}

export const getColId = (idx: number) => `col-${idx}`;
