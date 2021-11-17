import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import React from "react";
import {
  ColumnWrapper,
  Deref,
  getColId,
  getNameFromRef,
  isObject,
  isSupportedKeyword,
  PropertyWrapper,
  SchemaEntry,
  toSchemaEntry,
} from "./internal";

export interface SchemaProps {
  readonly clickHandler: ClickHandler;
  readonly dereference: Deref;
  /** Index of `schema` in `path` */
  readonly idx: number;
  readonly path: SchemaEntry[];
  readonly schema: JSONSchema7Definition;
}

export const Schema: React.VFC<SchemaProps> = (props) => {
  const {schema, idx} = props;

  if (typeof schema === "boolean") return null;

  /**
   * IMPORTANT STUFF
   * - type: "object", "array", other
   * - properties: if type: "object"; additionalProperties etc.
   * - items: if type: "array"; additionalItems etc.
   * - anyOf, oneOf, allOf, not; (if, then, else)
   */

  // Conceptually, ObjectSchema and ArraySchema could be simplified
  // to basically always returning arrays of elements.
  // Difference between them is that they use different Schema properties
  // to generate them, and arrays should have the distinguishing feature
  // of prepending their row groups anyOf/oneOf/allOf according to need.

  // I don't need them to be components... And since they are then rendering
  // the rows with

  // *** DON'T BE AFRAID OF PROP DRILLING ***
  // I mean eventually I should come up with a better solution for performance
  // reasons, but that time is not now.
  // (Also that would require something like a custom renderer, so...)

  const {
    additionalItems = {},
    additionalProperties = {},
    contains = {},
    items = [],
    patternProperties = {},
    properties = {},
    propertyNames = {},
  } = schema;

  const renderRows = makeRenderer(props);

  const propertyRows = renderRows(properties);
  const patternRows = renderRows(patternProperties);
  const addPropRows = renderRows({additionalProperties});
  const propNamesRows = renderRows({propertyNames});
  const itemRows = Array.isArray(items)
    ? renderRows(items)
    : renderRows({items});
  const addItemRows = renderRows({additionalItems});
  const containRows = renderRows({contains});

  return (
    <ColumnWrapper id={getColId(idx)}>
      {addItemRows}
      {addPropRows}
      {containRows}
      {itemRows}
      {patternRows}
      {propNamesRows}
      {propertyRows}
    </ColumnWrapper>
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

const getName = (entry: SchemaEntry): SchemaEntry => {
  const {schema} = entry;
  if (schema.title) return {...entry, name: schema.title};
  if (schema.$ref) {
    const name = getNameFromRef(schema.$ref);

    if (name) return {...entry, name};
  }
  return entry;
};

export type ClickHandler = (schemaEntry: SchemaEntry) => () => void;

type DerefEntry = (entry: SchemaEntry) => SchemaEntry;

/**
 * Dereference entry schema
 */
const derefEntry =
  (deref: Deref): DerefEntry =>
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

// TODO: to be expanded upon
const getChildren = (schema: JSONSchema7): string[] => {
  return Object.keys(schema).filter(isSupportedKeyword);
};

interface RowProps {
  readonly clickHandler: ClickHandler;
  readonly entry: SchemaEntry;
  readonly idx: number;
  readonly isKeyword?: boolean;
  readonly path: SchemaEntry[];
}

const Row: React.VFC<RowProps> = ({
  entry,
  path,
  idx,
  clickHandler,
  isKeyword,
}) => {
  const isLastColumn = React.useMemo(() => {
    return idx === path.length - 1;
  }, [idx, path]);

  const {key, schema, name} = entry;

  const hasChildren = !!getChildren(schema).length;
  const inPath = path[idx]?.key === key;
  const lastInPath = inPath && isLastColumn;

  return (
    <PropertyWrapper
      isKeyword={isKeyword}
      hasChildren={hasChildren}
      inPath={inPath}
      lastInPath={lastInPath}
      onClick={clickHandler(entry)}
    >
      {name}
    </PropertyWrapper>
  );
};

const makeRenderer =
  ({clickHandler, dereference, idx, path}: SchemaProps) =>
  (rows: Record<string, JSONSchema7Definition> | JSONSchema7Definition[]) => {
    return Object.entries(rows)
      .flatMap(filterNonSchema)
      .map(toSchemaEntry)
      .map(derefEntry(dereference))
      .map(getName)
      .map((entry) => (
        <Row
          key={`os-${idx}-${entry.key}`}
          idx={idx}
          clickHandler={clickHandler}
          path={path}
          entry={entry}
        />
      ));
  };
