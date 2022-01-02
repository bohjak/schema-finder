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
  /** Indicates whether the schema contains anything renderable in the next column */
  readonly hasChildren?: boolean;
  /** Is this property required */
  readonly isRequired?: boolean;
};
