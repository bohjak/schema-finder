import {JSONSchema7Definition} from "json-schema";
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
} from "./internal";

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

export async function buildSchemaEntries(
  parent?: SchemaEntry
): Promise<SchemaEntry[]> {
  if (parent === undefined) return Promise.reject("no entry");
  const {path, schema: parentSchema, deref} = parent;

  if (!parentSchema || typeof parentSchema !== "object") {
    console.error("parent schema is not a schema:", parentSchema);
    return Promise.reject(new TypeError("parent schema not a schema"));
  }

  const {required} = parentSchema;

  const {
    additionalItems,
    additionalProperties,
    allOf,
    anyOf,
    contains,
    else: sElse,
    if: sIf,
    items,
    not,
    oneOf,
    patternProperties,
    properties,
    propertyNames,
    then: sThen,
  } = parentSchema;

  const buildGroupedSchemaEntries = getGroupSchemaEntriesBuilder.bind(null, {
    required,
    path,
    deref,
  });

  /* 6.5 */
  const propertyRows = buildGroupedSchemaEntries(properties, "properties");
  const patternRows = buildGroupedSchemaEntries(
    patternProperties,
    "patternProperties"
  );
  const addPropRows = buildGroupedSchemaEntries(
    {additionalProperties},
    "additionalProperties"
  );
  const propNamesRows = buildGroupedSchemaEntries(
    {propertyNames},
    "propertyNames"
  );

  /* 6.4 */
  const itemRows = Array.isArray(items)
    ? buildGroupedSchemaEntries(items, "items")
    : buildGroupedSchemaEntries({items}, "items");
  const addItemRows = buildGroupedSchemaEntries(
    {additionalItems},
    "additionalItems"
  );
  const containRows = buildGroupedSchemaEntries({contains}, "contains");

  /* 6.7 */
  const allRows = buildGroupedSchemaEntries(allOf, "allOf");
  const anyRows = buildGroupedSchemaEntries(anyOf, "anyOf");
  const oneRows = buildGroupedSchemaEntries(oneOf, "oneOf");
  const notRows = buildGroupedSchemaEntries({not}, "not");

  /* 6.6 */
  const ifRows = buildGroupedSchemaEntries({if: sIf}, "if");
  const thenRows = buildGroupedSchemaEntries({then: sThen}, "then");
  const elseRows = buildGroupedSchemaEntries({else: sElse}, "else");

  const entries = await Promise.all([
    propertyRows,
    patternRows,
    addPropRows,
    propNamesRows,
    itemRows,
    addItemRows,
    containRows,
    allRows,
    anyRows,
    oneRows,
    notRows,
    ifRows,
    thenRows,
    elseRows,
  ]);

  return entries.flat().map((entry, idx) => ({...entry, idx}));
}

interface CommonProps {
  required?: string[];
  path?: string[];
  deref: Deref;
}

function getGroupSchemaEntriesBuilder(
  {required, path, deref}: CommonProps,
  rows?:
    | Record<string, JSONSchema7Definition | undefined>
    | JSONSchema7Definition[],
  group?: keyof JSONSchema7
): Promise<SchemaEntry[]> {
  if (!rows) return Promise.resolve([]);

  const entries = Object.entries(rows)
    .flatMap(([key, schema]): [string, JSONSchema7][] => {
      return typeof schema !== "object" ? [] : [[key, schema]];
    })
    .map((entry) => {
      return buildSchemaEntry({
        entry,
        deref,
        path,
        required,
        group,
      });
    });

  return Promise.all(entries);
}

// TODO: Has trouble with references
export function buildSchemaEntriesWithInlinedBooleanLogic(
  parent?: SchemaEntry
): Promise<SchemaEntry[]> {
  if (parent === undefined) return Promise.reject("no entry");
  const {path, schema: parentSchema, deref} = parent;
  const {required} = parentSchema;
  let i = 0;

  if (!parentSchema || typeof parentSchema !== "object") {
    console.error("parent schema is not a schema:", parentSchema);
    return Promise.reject(new TypeError("parent schema not a schema"));
  }

  const supported = typedEntries(parentSchema).flatMap(
    ([key, val]): [keyof JSONSchema7, JSONSchema7Object | JSONSchema7][] => {
      return isSupportedKeyword(key) && isObj(val) ? [[key, val]] : [];
    }
  );
  const schemaEntries = asyncFlatMap(supported, async (entry) => {
    let [key, schema] = entry;
    // console.log("what is going on", key, schema);
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

async function derefSchema<S extends Record<string, unknown>>(
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

function typedEntries<O extends object>(o: O): [keyof O, O[keyof O]][] {
  return Object.entries(o) as [keyof O, O[keyof O]][];
}

const isJsonSchema = (o: any): o is JSONSchema7 => {
  return Object.keys(o).every(isJsonSchemaKeyword);
};
