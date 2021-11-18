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
  RowGroupTitle,
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

  if (!schema || typeof schema !== "object") return null;

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
    allOf = [],
    anyOf = [],
    contains = {},
    else: sElse = {},
    if: sIf = {},
    items = [],
    not = {},
    oneOf = [],
    patternProperties = {},
    properties = {},
    propertyNames = {},
    then: sThen = {},
    required,
  } = schema;

  const renderRows = makeRenderer(props, required);

  /* 6.5 */
  const propertyRows = renderRows(properties);
  const patternRows = renderRows(patternProperties);
  const addPropRows = renderRows({additionalProperties});
  const propNamesRows = renderRows({propertyNames});

  /* 6.4 */
  const itemRows = Array.isArray(items)
    ? renderRows(items)
    : renderRows({items});
  const addItemRows = renderRows({additionalItems});
  const containRows = renderRows({contains});

  /* 6.7 */
  const allRows = renderRows(allOf);
  const anyRows = renderRows(anyOf);
  const oneRows = renderRows(oneOf);
  const notRows = renderRows({not});

  /* 6.6 */
  const ifRows = renderRows({if: sIf});
  const thenRows = renderRows({then: sThen});
  const elseRows = renderRows({else: sElse});

  return (
    <ColumnWrapper id={getColId(idx)}>
      {propertyRows}
      {patternRows}
      <RowGroup rows={addPropRows} title="additionalProperties" />
      {propNamesRows}

      {itemRows}
      <RowGroup rows={addItemRows} title="additionalItems" />
      {containRows}

      <RowGroup rows={allRows} title="allOf" />
      <RowGroup rows={anyRows} title="anyOf" />
      <RowGroup rows={oneRows} title="oneOf" />
      {notRows}

      {ifRows}
      {thenRows}
      {elseRows}
    </ColumnWrapper>
  );
};

interface RowGroupProps {
  rows: JSX.Element[];
  title?: string;
}

const RowGroup: React.VFC<RowGroupProps> = ({rows, title}) => {
  if (!rows.length) return null;

  return (
    <>
      {title && <RowGroupTitle>{title}</RowGroupTitle>}
      {rows}
    </>
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

export type ClickHandler = (schemaEntry: SchemaEntry) => () => void;

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

const addName: EntryDecorator = (entry) => {
  const {schema} = entry;
  if (schema.title) return {...entry, name: schema.title};
  if (schema.$ref) {
    const name = getNameFromRef(schema.$ref);

    if (name) return {...entry, name};
  }
  return entry;
};

export const addHasChildren: EntryDecorator = (entry) => {
  const {schema} = entry;
  const hasChildren = !!Object.keys(schema).filter(isSupportedKeyword).length;
  return {...entry, hasChildren};
};

const addIsRequired =
  (required?: string[]): EntryDecorator =>
  (entry) => {
    const {key} = entry;
    const isRequired = required?.includes(key);
    return {...entry, isRequired};
  };

const addPath =
  (path: string[]): EntryDecorator =>
  (entry) => {
    const {key} = entry;
    return {...entry, path: [...path, key]};
  };

const makeRenderer =
  ({clickHandler, dereference, idx, path}: SchemaProps, required?: string[]) =>
  (rows: Record<string, JSONSchema7Definition> | JSONSchema7Definition[]) => {
    const keyPath = path.map((entry) => entry.key);

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
          key={`os-${idx}-${entry.key}`}
          idx={idx}
          clickHandler={clickHandler}
          path={path}
          entry={entry}
        />
      ));
  };
