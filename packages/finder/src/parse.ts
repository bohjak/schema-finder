import {JSONSchema7, JSONSchema7Definition} from "json-schema";
import {mergeUris} from "./internal";

export type SchemaNodes = Record<string, SchemaNode>;

export interface SchemaNode {
  /** Reference identifier */
  uri: string;
  /** References to parent nodes */
  parents: SchemaNodes;
  /** References to child nodes */
  children: SchemaNodes;

  /** #Meta */
  title?: string;
  description?: string;
  valueType: string | string[];
  requiredProperties?: string[];
  examples?: string[];
  /** Display label to be used for the individual rows TODO: improve description */
  key: string;
}

interface ParseArgs {
  /** Schema to be processed */
  schema: JSONSchema7Definition;
  /** Doubly-multiply-linked list */
  nodes: SchemaNodes;
  /** Non-fatal errors encountered during parsing */
  errs: Error[];
  /** Currently set base URI */
  baseUri?: string;
  /** Current fragment path relative to baseUri */
  currentPath?: string;
  /** Parents of the current schema */
  parents?: SchemaNodes;
  /** Queue of schemas waiting to be dereferenced; key is the referenced URI, value the parents of the schemas that reference it */
  derefQ?: Record<string, SchemaNodes>;
  /** Flag to mark that a schema is a definition and doesn't need to be linked to its parent */
  isDefinition?: boolean;
}

/**
 * Traverses the schema and resolves all URIs and remote schemas (if enabled), creating a flat URI/subschema dictionary.
 * @returns Parent / root node
 */
export function parseJSONSchema7({
  schema,
  nodes,
  baseUri = "",
  currentPath = "",
  parents = {},
  errs,
  derefQ = {},
  isDefinition,
}: ParseArgs): SchemaNode | undefined {
  // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-4.3.1
  // We don't want to deal with booleans
  if (schema === true) {
    schema = {};
  } else if (schema === false) {
    schema = {not: {}};
  }

  // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.3
  // If schema is a reference object, it either references an already processed node, in which case we simply link it, otherwise add it to the dereferencing queue.
  if (schema.$ref) {
    // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.3.2
    const refUri = mergeUris(baseUri, schema.$ref);

    if (refUri in nodes) {
      const node = nodes[refUri];
      node.parents = {...node.parents, ...parents};
      for (const parent of Object.values(parents)) {
        parent.children[refUri] = node;
      }
    } else {
      if (refUri in derefQ) {
        parents = {...parents, ...derefQ[refUri]};
      }
      derefQ[refUri] = parents;
    }

    // All other properties in a "$ref" object MUST be ignored.
    return;
  }

  // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.2
  // $id defines a URI for the schema
  // A subschema's $id is resolved against the base URI
  if (schema.$id) {
    const newBaseUri = mergeUris(baseUri, schema.$id);

    if (newBaseUri !== baseUri) {
      return parseJSONSchema7({
        schema,
        baseUri: newBaseUri,
        currentPath,
        nodes,
        parents,
        errs,
        derefQ,
      });
    }
  }

  /************************************************************
   * Create the current schema node and link it to its parent *
   ************************************************************/

  const uri = mergeUris(baseUri, `#${currentPath}`);
  let [key] = currentPath.split("/").slice(-1);
  key = key || baseUri;

  if (isDefinition) {
    parents = {};
  }

  if (uri in derefQ) {
    parents = derefQ[uri];

    // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-01#section-8.3
    // Cyclical references (generally references referencing other references) never actually get dereferenced, because as soon as we detect $ref, this function returns.
    // It's never going to happen that the schema is in derefQueue and has reference itself (or rather it may happen but it's never gonna get here).
  }

  const examples = [];
  if (Array.isArray(schema.examples)) {
    examples.push(
      ...schema.examples.map((example) =>
        JSON.stringify(example, undefined, "\t")
      )
    );
  } else if (typeof schema.examples === "object") {
    examples.push(JSON.stringify(schema.examples, undefined, "\t"));
  } else {
    const example = schema.examples?.toString();
    if (example != undefined) {
      examples.push(example);
    }
  }

  const node: SchemaNode = {
    uri,
    parents,
    children: {},
    key,
    title: schema.title,
    description: schema.description,
    valueType: schema.type ?? "object (implicit)",
    requiredProperties: schema.required,
    examples,
  };
  nodes[uri] = node;
  for (const parent of Object.values(parents)) {
    parent.children[uri] = node;
  }

  /*******************************************************************
   * Go one by one through the schema fields and create schema nodes *
   *******************************************************************/

  /**
   * A less cumbersome wrapper for parseJSONSchema7
   */
  const parseProp = (
    newSchema: JSONSchema7Definition | undefined,
    newPath: string | undefined,
    isDefinition?: boolean
  ) => {
    if (!newSchema || !newPath) return;
    parseJSONSchema7({
      schema: newSchema,
      currentPath: newPath,
      parents: {[uri]: node},
      baseUri,
      nodes,
      errs,
      derefQ,
      isDefinition,
    });
  };

  for (let prop of Object.keys(schema)) {
    prop = prop as keyof JSONSchema7;
    let newSchema: JSONSchema7Definition | undefined;
    let newPath: string | undefined;
    switch (prop) {
      case "properties":
      case "patternProperties":
      case "allOf":
      case "anyOf":
      case "oneOf":
      case "definitions":
        {
          for (const key of Object.keys(schema[prop] ?? {})) {
            // @ts-expect-error Indexing by string
            newSchema = schema[prop]?.[key];
            newPath = `${currentPath}/${prop}/${key}`;
            parseProp(newSchema, newPath, prop === "definitions");
          }
        }
        break;

      case "additionalProperties":
      case "additionalItems":
      case "propertyNames":
      case "contains":
      case "if":
      case "then":
      case "else":
      case "not":
        {
          newPath = `${currentPath}/${prop}`;
          newSchema = schema[prop];
          parseProp(newSchema, newPath);
        }
        break;

      case "items":
        {
          const propValue = schema[prop];
          if (Array.isArray(propValue)) {
            for (const key of Object.keys(propValue)) {
              // @ts-expect-error Indexing by string
              newSchema = propValue[key];
              newPath = `${currentPath}/${prop}/${key}`;
              parseProp(newSchema, newPath);
            }
          } else {
            newPath = `${currentPath}/${prop}`;
            newSchema = propValue;
            parseProp(newSchema, newPath);
          }
        }
        break;

      case "dependencies":
        {
          for (const key of Object.keys(schema[prop] ?? {})) {
            const keyValue = schema[prop]?.[key];
            // https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6.5.7
            // dependencies can specify an array of properties that must exist in the instance if the key is a property
            if (Array.isArray(keyValue)) continue;

            newSchema = keyValue;
            newPath = `${currentPath}/${prop}/${key}`;
            parseProp(newSchema, newPath);
          }
        }
        break;
    }
  }

  return node;
}
