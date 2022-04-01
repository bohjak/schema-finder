import type {Deref, JSONSchema7} from "./internal";

export type SchemaEntry = {
  /** Key in parent schema */
  readonly key: string;
  /** Function to resolve references */
  readonly deref: Deref;
  /** Display name */
  readonly name: string;
  /** Schema value */
  readonly schema: JSONSchema7;
  /** Index inside the global entries object */
  readonly idx?: number;
  /** Path through parent schemas */
  readonly path?: string[];
  /**
   * Indicates whether the schema contains anything renderable
   * in the next column
   */
  readonly hasChildren?: boolean;
  /** Is this property required */
  readonly isRequired?: boolean;
  /**
   * Can be used to group together related entries
   * @example "anyOf"
   */
  readonly group?: string;
};
