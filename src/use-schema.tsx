import React from 'react';
import type { JSONSchema7 } from 'json-schema';
import { cleverDeepGet } from './helpers';

interface Ctx {
  schema: JSONSchema7;
  fromSchema: (path?: string[]) => JSONSchema7;
}
const SchemaCtx = React.createContext<Ctx | undefined>(undefined);

export interface SchemaProviderProps {
  schema: JSONSchema7;
}

export const SchemaProvider: React.FC<SchemaProviderProps> = ({
  children,
  schema,
}) => {
  const fromSchema = cleverDeepGet(schema);

  return (
    <SchemaCtx.Provider value={{ schema, fromSchema }}>
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
