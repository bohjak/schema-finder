import React from "react";

export type Path = string[];
export type SetPath = (path: Path) => void;

type Ctx = [path: Path, setter: SetPath];
const PathCtx = React.createContext<Ctx | undefined>(undefined);

export const PathProvider: React.FC = ({children}) => {
  const state = React.useState<Path>([]);

  return <PathCtx.Provider value={state}>{children}</PathCtx.Provider>;
};

/**
 * @returns Path context
 * @throws When used outside of a Path Context Provider
 */
export const usePath = () => {
  const state = React.useContext(PathCtx);

  if (state === undefined)
    throw new Error("usePath must be used within a PathProvider");

  return state;
};
