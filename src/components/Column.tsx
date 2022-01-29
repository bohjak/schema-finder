import React from "react";
import {
  ColumnWrapper,
  EntryIcon,
  EntryName,
  PropertyWrapper,
  RowGroupTitle,
  RowGroupWrapper,
  SchemaEntry,
  showName,
} from "./internal";

const DEFAULT = "default";

export interface ColumnProps {
  readonly idx: number;
  readonly entries: SchemaEntry[];
  readonly selectedRow?: number;
  readonly isLast?: boolean;
  readonly clickHandler: (entry: SchemaEntry) => () => void;
  readonly focus?: boolean;
}

const showGroup = (group: string, entries: SchemaEntry[]) => {
  return (
    group !== DEFAULT &&
    entries.length === 1 &&
    showName(entries[0].key) &&
    entries[0].name !== group
  );
};

export const Column: React.VFC<ColumnProps> = ({
  entries,
  isLast,
  selectedRow,
  clickHandler,
  idx: colIdx,
  focus,
}) => {
  const byGroup: Record<string, SchemaEntry[]> = {};
  for (const entry of entries) {
    const {group = DEFAULT} = entry;
    if (!(group in byGroup)) byGroup[group] = [];
    byGroup[group].push(entry);
  }

  const colRef: React.RefCallback<HTMLElement> = (col) => {
    if (focus) {
      col?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end",
      });
    }
  };

  return (
    <ColumnWrapper id={`col-${colIdx}`} ref={colRef}>
      {Object.entries(byGroup).map(([group, entries]) => {
        return (
          <RowGroupWrapper key={`gr-${colIdx}-${group}`}>
            {showGroup(group, entries) && (
              <RowGroupTitle>{group}</RowGroupTitle>
            )}
            {entries.map((entry) => {
              const {key, hasChildren, isRequired, idx: rowIdx, name} = entry;
              return (
                <PropertyWrapper
                  key={`row-${colIdx}-${rowIdx}`}
                  inPath={rowIdx === selectedRow}
                  lastInPath={isLast && rowIdx === selectedRow}
                  isRequired={isRequired}
                  onClick={clickHandler(entry)}
                >
                  <EntryName>{showName(key) ? name : key}</EntryName>
                  {hasChildren && <EntryIcon>&gt;</EntryIcon>}
                </PropertyWrapper>
              );
            })}
          </RowGroupWrapper>
        );
      })}
    </ColumnWrapper>
  );
};
