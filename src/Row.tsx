import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import React from "react";
import {
  Deref,
  getNameFromRef,
  isObject,
  isSupportedKeyword,
  PropertyWrapper,
  SchemaEntry,
  toSchemaEntry,
} from "./internal";

export type ClickHandler = (schemaEntry: SchemaEntry) => () => void;

export interface RowProps {
  readonly clickHandler: ClickHandler;
  readonly entry: SchemaEntry;
  readonly idx: number;
  readonly isKeyword?: boolean;
  readonly path: SchemaEntry[];
}

export const Row: React.VFC<RowProps> = ({
  entry,
  path,
  idx,
  clickHandler,
  isKeyword,
}) => {
  const isLastColumn = React.useMemo(() => {
    return idx === path.length - 1;
  }, [idx, path]);

  const {key, name, hasChildren, isRequired} = entry;

  const inPath = path[idx]?.key === key;
  const lastInPath = inPath && isLastColumn;

  return (
    <PropertyWrapper
      isKeyword={isKeyword}
      hasChildren={hasChildren}
      inPath={inPath}
      lastInPath={lastInPath}
      onClick={clickHandler(entry)}
      isRequired={isRequired}
    >
      {name}
    </PropertyWrapper>
  );
};

const isSchema = (prop?: JSONSchema7Definition): prop is JSONSchema7 =>
  typeof prop === "object" && !!Object.keys(prop).length;

/**
 * Filters out anything that's not a useful schema.
 *
 * Use with `flatMap`.
 *
 * @param {Entry} PropEntry
 *
 * @example
 * Object.entries(schema.properties).flatMap(filterNonSchema);
 */
const filterNonSchema = ([key, prop]: [string, JSONSchema7Definition]): [
  string,
  JSONSchema7
][] => {
  return isSchema(prop) ? [[key, prop]] : [];
};

type EntryDecorator = (entry: SchemaEntry) => SchemaEntry;

/**
 * Dereference entry schema
 */
const derefEntry =
  (deref: Deref): EntryDecorator =>
  (entry) => {
    const {schema} = entry;

    const [derefSchema, err] = deref(schema);
    if (err) {
      console.error("Error dereferencing entry", entry, err);
    }

    if (isObject(derefSchema)) {
      return {...entry, schema: derefSchema};
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
export const addHasChildren: EntryDecorator = (entry) => {
  const {schema} = entry;
  const hasChildren = !!Object.keys(schema).filter(isSupportedKeyword).length;
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
  (path: string[]): EntryDecorator =>
  (entry) => {
    const {key} = entry;
    return {...entry, path: [...path, key]};
  };

export interface CommonRowProps {
  readonly clickHandler: ClickHandler;
  readonly dereference: Deref;
  /** Index of `schema` in `path` */
  readonly colIdx: number;
  readonly path: SchemaEntry[];
}

export type RenderRowsWithPropsAndReq = (
  rows: Record<string, JSONSchema7Definition> | JSONSchema7Definition[]
) => JSX.Element[];
export type RenderRowsWithProps = (
  required?: string[]
) => RenderRowsWithPropsAndReq;
export type RenderRows = (commonProps: CommonRowProps) => RenderRowsWithProps;

/**
 * An unreasonably complicated curried function to transform schema object
 * entries into an array of Row components.
 *
 * The biggest problem here is that way too much global-ish data is required
 * and available in different parts of the tree.
 *
 * Curried like this, because we need the types of the individual partially
 * applied stages (well, at least one of them anyway)
 */
export const renderRows: RenderRows = (commonProps) => (required) => (rows) => {
  const {clickHandler, dereference, colIdx, path} = commonProps;
  const keyPath = path.slice(0, colIdx).map((entry) => entry.key);

  return Object.entries(rows)
    .flatMap(filterNonSchema)
    .map(toSchemaEntry)
    .map(derefEntry(dereference))
    .map(addName)
    .map(addHasChildren)
    .map(addIsRequired(required))
    .map(addPath(keyPath))
    .map((entry) => (
      <Row
        key={`os-${colIdx}-${entry.key}`}
        idx={colIdx}
        clickHandler={clickHandler}
        path={path}
        entry={entry}
      />
    ));
};
