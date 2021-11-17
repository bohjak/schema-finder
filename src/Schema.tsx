import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import React from "react";
import {
  ColumnWrapper,
  DeepGet,
  getColId,
  getNameFromRef,
  isSupportedKeyword,
  parseRef,
  PropertyWrapper,
} from "./internal";
import {SchemaEntry} from "./types";
import {toSchemaEntry} from "./utils";

export const Schema: React.VFC<SchemaProps<JSONSchema7Definition>> = (
  props
) => {
  const {schema} = props;

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

  switch (schema.type) {
    case "object":
      return <ObjectSchema {...props} />;
    case "array":
      return <ArraySchema {...props} />;
    default: {
      // Nothing?
      return null;
    }
  }
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

const getNames = (entry: SchemaEntry): SchemaEntry => {
  const {schema} = entry;
  if (schema.title) return {...entry, name: schema.title};
  if (schema.$ref) {
    const name = getNameFromRef(schema.$ref);

    if (name) return {...entry, name};
  }
  return entry;
};

export type ClickHandler = (schemaEntry: SchemaEntry) => () => void;

// TODO: evaluate reimplementing cleverDeepGet here with support for entries
const dereference =
  (fromSchema: DeepGet) =>
  (entry: SchemaEntry): SchemaEntry => {
    const {schema} = entry;

    if (!schema.$ref) return entry;

    // FIXME: duplicated from cleverDeepGet
    const derefSchema = {...schema, ...fromSchema(parseRef(schema.$ref))};

    return {...entry, schema: derefSchema};
  };

// const betterDereference = (globalSchema: JSONSchema7, )

// TODO: to be expanded upon
const getChildren = (schema: JSONSchema7): string[] => {
  return Object.keys(schema).filter(isSupportedKeyword);
};

interface RowProps {
  readonly entry: SchemaEntry;
  readonly path: SchemaEntry[];
  readonly idx: number;
  readonly clickHandler: ClickHandler;
}

const Row: React.VFC<RowProps> = ({entry, path, idx, clickHandler}) => {
  const isLastColumn = React.useMemo(() => {
    return idx === path.length - 1;
  }, [idx, path]);

  const {key, schema, name} = entry;

  const hasChildren = !!getChildren(schema).length;
  const inPath = path[idx]?.key === key;
  const lastInPath = inPath && isLastColumn;

  return (
    <PropertyWrapper
      key={`os-${idx}-${key}`}
      hasChildren={hasChildren}
      inPath={inPath}
      lastInPath={lastInPath}
      onClick={clickHandler(entry)}
    >
      {name}
    </PropertyWrapper>
  );
};

// const renderRows = (
//   schema: JSONSchema7,
//   commonProps: Omit<RowProps, "entry">
// ): JSX.Element[] => {
//   return Object.entries(schema)
//     .flatMap(filterNonSchema)
//     .map(toSchemaEntry)
//     .map(dereference(fromSchema))
//     .map(getNames)
//     .map((entry) => <Row {...commonProps} entry={entry} />);
// };

export interface SchemaProps<S = JSONSchema7> {
  readonly clickHandler: ClickHandler;
  readonly fromSchema: DeepGet;
  /** Index of `schema` in `path` */
  readonly idx: number;
  readonly path: SchemaEntry[];
  readonly schema: S;
}

export const ObjectSchema: React.VFC<SchemaProps> = ({
  clickHandler,
  fromSchema,
  idx,
  path,
  schema,
}) => {
  const {properties = {}, additionalProperties, propertyNames} = schema;

  const props = Object.entries(properties)
    .flatMap(filterNonSchema)
    .map(toSchemaEntry)
    .map(dereference(fromSchema))
    .map(getNames)
    .map((entry) => (
      <Row idx={idx} clickHandler={clickHandler} path={path} entry={entry} />
    ));
  // TODO: pattern additional props

  const showAddProps: boolean = React.useMemo(() => {
    return (
      isSchema(additionalProperties) &&
      !!getChildren(additionalProperties).length
    );
  }, [additionalProperties]);

  const showPropNames: boolean = React.useMemo(() => {
    return isSchema(propertyNames) && !!getChildren(propertyNames).length;
  }, [propertyNames]);

  return (
    <ColumnWrapper id={getColId(idx)}>
      {props}
      {showAddProps && (
        <Row
          idx={idx}
          clickHandler={clickHandler}
          path={path}
          entry={{
            key: "additionalProperties",
            name: "additionalProperties",
            schema: additionalProperties as JSONSchema7,
          }}
        />
      )}
      {showPropNames && (
        <Row
          idx={idx}
          clickHandler={clickHandler}
          path={path}
          entry={{
            key: "propertyNames",
            name: "propertyNames",
            schema: propertyNames as JSONSchema7,
          }}
        />
      )}
    </ColumnWrapper>
  );
};

export const ArraySchema: React.VFC<SchemaProps> = ({idx}) => {
  return <ColumnWrapper id={getColId(idx)}>Array</ColumnWrapper>;
};
