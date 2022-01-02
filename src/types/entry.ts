import type {JSONSchema7} from "./internal";

export type SchemaEntry = {
  /** Key in parent schema */
  readonly key: string;
  /** Display name */
  readonly name: string;
  /** Schema value */
  readonly schema: JSONSchema7;
  /** Path through parent schemas */
  readonly path?: string[];
  /**
   * Indicates whether the schema contains anything renderable
   * in the next column
   * @deprecated In favour of `children`
   */
  readonly hasChildren?: boolean;
  /** Children schemas */
  readonly children?: [string, unknown][];
  /** Is this property required */
  readonly isRequired?: boolean;
  /** Type of the entry ¯\_(ツ)_/¯ */
  readonly type?: "keyword" | "property" | "item";
};
