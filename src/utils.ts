import {Deref, JSONSchema7, SchemaEntry} from "./internal";

export const id = <T>(x: T): T => x;
export const noop = () => {};

export const isObj = (prop?: unknown): prop is Record<string, unknown> =>
  prop !== null && typeof prop === "object" && !!Object.keys(prop).length;

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
