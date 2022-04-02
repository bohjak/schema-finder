import {JSONSchema7, R} from "./internal";

// Is in ./types because SchemaEntry needs it
export type Deref = (ref?: string) => Promise<R<unknown>>;

export type DerefBuilder = (root: JSONSchema7, options?: DerefOptions) => Deref;

export interface DerefOptions {
  /**
   * Will allow resolving remote URI addresses in $ref over the network.
   *
   * **Do not** allow unless you know ahead of time the contents of the schema.
   *
   * @example {"$ref": "http://json-schema.org/draft-07/schema/#"}
   */
  unsafeAllowRemoteUriResolution?: boolean;
}
