import {
  asyncFlatMap,
  buildDeref,
  Deref,
  DerefOptions,
  getNameFromRef,
  isJsonSchemaKeyword,
  isObj,
  isRetroKeyword,
  isSupportedKeyword,
  JSONSchema7,
  JSONSchema7Object,
  SchemaEntry,
  toSchemaEntry,
} from "./internal";

type EntryDecorator = (
  entry: SchemaEntry
) => SchemaEntry | Promise<SchemaEntry>;

/**
 * Dereferences an entry schema
 */
const derefEntry: EntryDecorator = async (entry) => {
  const {schema, deref} = entry;

  const [derefed, err] = await deref(schema.$ref);
  if (err) {
    console.warn("Error dereferencing entry", entry, err);
  }

  if (isObj(derefed)) {
    return {...entry, schema: {...schema, ...derefed}};
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

// TODO: define test cases
export function buildSchemaEntries(
  parent?: SchemaEntry
): Promise<SchemaEntry[]> {
  if (parent === undefined) return Promise.reject("no entry");
  const {path, schema, deref} = parent;
  const {required} = schema;
  let i = 0;

  const supported = typedEntries(schema).flatMap(
    ([key, val]): [keyof JSONSchema7, JSONSchema7Object | JSONSchema7][] => {
      return isSupportedKeyword(key) && isObj(val) ? [[key, val]] : [];
    }
  );
  const schemaEntries = asyncFlatMap(supported, async (entry) => {
    let [key, schema] = entry;
    console.log("what is going on", key, schema);
    schema = await derefSchema(deref, schema as Record<string, unknown>);
    if (Object.keys(schema).some(isRetroKeyword)) {
      return Object.entries(schema);
    }
    return [[key, schema] as [keyof JSONSchema7, JSONSchema7]];
  }).then((entries) => {
    return Promise.all(
      entries.flatMap((entry) => {
        let [group, props] = entry;
        if (isJsonSchema(props)) {
          props = {[group]: props};
        }
        return Object.entries(props).map((entry) =>
          buildSchemaEntry({
            entry: entry as [string, JSONSchema7],
            deref,
            group: group.toString(),
            idx: i++,
            path,
            required,
          })
        );
      })
    );
  });

  return schemaEntries;
}

export async function derefSchema<S extends Record<string, unknown>>(
  deref: Deref,
  schema: S
): Promise<S> {
  if ("$ref" in schema && typeof schema.$ref === "string") {
    const [derefed, err] = await deref(schema.$ref);
    if (err !== undefined) {
      console.warn(err);
    }

    if (isObj(derefed)) {
      return {...schema, ...derefed};
    }
  }
  return schema;
}

export function typedEntries<O extends object>(o: O): [keyof O, O[keyof O]][] {
  return Object.entries(o) as [keyof O, O[keyof O]][];
}

const isJsonSchema = (o: any): o is JSONSchema7 => {
  return Object.keys(o).every(isJsonSchemaKeyword);
};
