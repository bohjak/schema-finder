import type { JSONSchema7 } from 'json-schema';
import React from 'react';
import { cleverDeepGet } from './internal';

interface Ctx {
  schema: JSONSchema7;
  setSchema: (schema: JSONSchema7) => void;
  fromSchema: (path?: string[]) => JSONSchema7;
}
const SchemaCtx = React.createContext<Ctx | undefined>(undefined);

export const SchemaProvider: React.FC = ({ children }) => {
  const [schema, setSchema] = React.useState<JSONSchema7>({});

  const fromSchema = React.useCallback(cleverDeepGet(schema), [schema]);

  return (
    <SchemaCtx.Provider value={{ schema, fromSchema, setSchema }}>
      {children}
    </SchemaCtx.Provider>
  );
};

/**
 * @returns Schema context
 * @throws When used outside of a Schema Context Provider
 */
export const useSchema = () => {
  const state = React.useContext(SchemaCtx);

  if (state === undefined)
    throw new Error('useSchema must be used within a SchemaProvider');

  return state;
};
