import {
  buildDeref,
  Deref,
  DerefOptions,
  getNameFromRef,
  isObject,
  isRetroKeyword,
  isSupportedKeyword,
  JSONSchema7,
  JSONSchema7Definition,
  SchemaEntry,
  toSchemaEntry,
} from "./internal";

export const isObj = (prop?: unknown): prop is object =>
  prop !== null && typeof prop === "object" && !!Object.keys(prop).length;

/**
 * Filters out anything that's not a useful schema
 *
 * @example
 * Object.entries(schema.properties).flatMap(filterNonSchema);
 */
const filterNonSchema = ([key, prop]: [string, JSONSchema7Definition]): [
  string,
  JSONSchema7
][] => {
  return isObj(prop) ? [[key, prop]] : [];
};

type EntryDecorator = (
  entry: SchemaEntry
) => SchemaEntry | Promise<SchemaEntry>;

/**
 * Dereferences an entry schema
 */
const derefEntry: EntryDecorator = async (entry) => {
  const {schema, deref} = entry;

  const [derefSchema, err] = await deref(schema.$ref);
  if (err) {
    console.error("Error dereferencing entry", entry, err);
  }

  if (isObject(derefSchema)) {
    return {...entry, schema: {...schema, ...derefSchema}};
  } else {
    return entry;
  }
};

/**
 * Decorates an entry with a display name taken from its schema
 */
const addName: EntryDecorator = (entry) => {
  const {schema} = entry;
  if (schema.title) return {...entry, name: schema.title};
  if (schema.$ref) {
    const name = getNameFromRef(schema.$ref);

    if (name) return {...entry, name};
  }
  return entry;
};

/**
 * Decorates an entry with info about whether its schema contains keywords
 * renderable in a column
 */
const addHasChildren: EntryDecorator = (entry) => {
  const {schema} = entry;
  const hasChildren = Object.entries(schema)
    .filter(([key]) => isSupportedKeyword(key))
    .some(([, obj]) => isObj(obj));

  return {...entry, hasChildren};
};

/**
 * Decorates an entry with info about whether its key is contained in a list
 * of required properties
 */
const addIsRequired =
  (required?: string[]): EntryDecorator =>
  (entry) => {
    const {key} = entry;
    const isRequired = required?.includes(key);
    return {...entry, isRequired};
  };

/**
 * Decorates an entry with its full path
 */
const addPath =
  (path: string[] = []): EntryDecorator =>
  (entry) => ({...entry, path: [...path, entry.key]});

/**
 * Decorates an entry with a group identifier for aggregation
 */
const addGroup =
  (group?: string): EntryDecorator =>
  (entry) => ({...entry, group});

const addIdx =
  (idx?: number): EntryDecorator =>
  (entry) => ({...entry, idx});

const debug: EntryDecorator = (entry) => (
  console.log("debug entry: ", entry), entry
);

export interface SchemaEntryBuilderParams {
  entry: [string, JSONSchema7];
  group?: string;
  required?: string[];
  path?: string[];
  idx?: number;
  deref?: Deref;
  derefOptions?: DerefOptions;
}

export function buildSchemaEntry({
  entry,
  group,
  required,
  path,
  idx,
  deref,
  derefOptions,
}: SchemaEntryBuilderParams): Promise<SchemaEntry> {
  if (deref === undefined) {
    const [, schema] = entry;
    deref = buildDeref(schema, derefOptions);
  }

  return toSchemaEntry(entry, deref)
    .then(derefEntry)
    .then(addName)
    .then(addHasChildren)
    .then(addGroup(group))
    .then(addIsRequired(required))
    .then(addPath(path))
    .then(addIdx(idx));
}

export function buildSchemaEntries(
  parent?: SchemaEntry
): Promise<SchemaEntry[]> {
  if (parent === undefined) return Promise.reject("no entry");
  const {path, schema, deref} = parent;
  const {required} = schema;
  let i = 0;
  const columnPromise = Object.entries(schema)
    .filter(([key, val]) => isSupportedKeyword(key) && isObj(val))
    .flatMap((prop) => {
      const [, val] = prop;
      // FIXME: this could contain a $ref
      if (Object.keys(val).some((key) => isRetroKeyword(key))) {
        return Object.entries(val);
      }
      return [prop];
    })
    .flatMap(([group, props]) => {
      // FIXME: fix types
      return Object.entries(props as any).map((entry) =>
        buildSchemaEntry({
          entry: entry as [string, JSONSchema7],
          deref,
          group,
          idx: i++,
          path,
          required,
        })
      );
    });

  return Promise.all(columnPromise);
}
