import React from "react";
import {PropertyWrapper, SchemaEntry, EntryName, EntryIcon} from "./internal";

export interface RowProps {
  readonly entry: SchemaEntry;
  readonly clickHandler: () => void;
  readonly isInPath?: boolean;
  readonly isSelected?: boolean;
}

/**
 * # WIP
 * Not ready for use
 * @todo Relying on a non-finalised specification of `entry.type`
 * @todo Unclear whether clickHandler will be sufficient like this
 */
export const Row: React.VFC<RowProps> = ({
  entry,
  clickHandler,
  isInPath,
  isSelected,
}) => {
  const {isRequired, type, hasChildren, key, name} = entry;

  return (
    <PropertyWrapper
      isKeyword={type === "keyword"}
      hasChildren={hasChildren}
      inPath={isInPath}
      lastInPath={isSelected}
      onClick={clickHandler}
      isRequired={isRequired}
    >
      <EntryName>{type !== "property" ? name : key}</EntryName>
      {hasChildren && <EntryIcon>&gt;</EntryIcon>}
    </PropertyWrapper>
  );
};
