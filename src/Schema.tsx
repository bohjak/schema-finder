import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import React from "react";
import styled from "styled-components";
import {
  ColumnWrapper,
  createMemberCheck,
  DeepGet,
  getColId,
  getNameFromRef,
  parseRef,
  PropertyWrapper,
} from "./internal";

const Column = styled.ul``;

const Row = styled.li``;

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

const getNames = (entry: Entry): Entry => {
  const [, prop] = entry;
  if (prop.title) return [prop.title, prop];
  if (prop.$ref) {
    const name = getNameFromRef(prop.$ref);

    console.log("Get Name", entry[0], name, prop.$ref);
    if (name) return [name, prop];
  }
  return entry;
};

type Entry<P = JSONSchema7> = [key: string, prop: P];

export type ClickHandler = (schemaEntry: Entry) => () => void;

/**
 * Filters out anything that's not a useful schema.
 *
 * Use with `flatMap`.
 *
 * @param {Entry} PropEntry
 *
 * @example
 * Object.entries(schema.properties).flatMap(fuckDefs);
 */
const fuckDefs = ([key, prop]: Entry<JSONSchema7Definition>): Entry[] => {
  return typeof prop === "object" && Object.keys(prop).length
    ? [[key, prop]]
    : [];
};

// TODO: evaluate reimplementing cleverDeepGet here with support for entries
const dereference =
  (fromSchema: DeepGet) =>
  (entry: Entry): Entry[] => {
    const [key, prop] = entry;

    if (!prop.$ref) return [entry];

    // FIXME: duplicated from cleverDeepGet
    const derefProp = {...prop, ...fromSchema(parseRef(prop.$ref))};

    return [[key, derefProp]];
  };

/**
 * Keywords we're currently capable of handling and displaying
 */
const supportedKeywords: (keyof JSONSchema7)[] = ["properties"];

const isSupportedKeyword = createMemberCheck(supportedKeywords);

// TODO: to be expanded upon
const getChildren = (schema: JSONSchema7): string[] => {
  return Object.keys(schema).filter(isSupportedKeyword);
};

export type SmartPath = [name: string, schema: JSONSchema7Definition][];

export interface SchemaProps<S = JSONSchema7> {
  readonly clickHandler: ClickHandler;
  readonly fromSchema: DeepGet;
  /** Index of `schema` in `path` */
  readonly idx: number;
  readonly path: SmartPath;
  readonly schema: S;
}

export const ObjectSchema: React.VFC<SchemaProps> = ({
  clickHandler,
  fromSchema,
  idx,
  path,
  schema,
}) => {
  const {properties = {}, additionalProperties} = schema;

  const props = Object.entries(properties)
    .flatMap(fuckDefs)
    .flatMap(dereference(fromSchema))
    // TODO: I think I'll need to keep the key as well
    .map(getNames)
    .map((entry, i) => {
      const [name, val] = entry;

      const hasChildren = !!getChildren(val).length;
      console.log("In Path", name, idx, path);
      const inPath = path[idx]?.[0] === name;
      const lastInPath = inPath && idx === path.length - 1;

      return (
        <PropertyWrapper
          key={`os-${i}-${name}`}
          hasChildren={hasChildren}
          inPath={inPath}
          lastInPath={lastInPath}
          onClick={clickHandler(entry)}
        >
          {name}
        </PropertyWrapper>
      );
    });
  // TODO: pattern additional props

  return (
    <ColumnWrapper id={getColId(idx)}>
      {props}
      {/* {additionalProperties && <PropertyWrapper hasChildren inPath={} name={"additionalProperties"} />} */}
    </ColumnWrapper>
  );
};

export const ArraySchema: React.VFC<SchemaProps> = ({schema}) => {
  return <Column>Array</Column>;
};
