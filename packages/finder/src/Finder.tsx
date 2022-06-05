import React from "react";
import {
  Breadcrumbs,
  buildSchemaEntries,
  buildSchemaEntry,
  Column,
  Columns,
  DerefOptions,
  getKeyDownHandler,
  Info,
  InnerWrapper,
  JSONSchema7,
  OuterWrapper,
  SchemaEntry,
} from "./internal";

export interface FinderProps extends DerefOptions {
  /** Dict of schemas to be displayed; Key used for display name */
  readonly schemas: Record<string, JSONSchema7>;
}

const InternalFinder: React.VFC<FinderProps> = ({
  schemas,
  unsafeAllowRemoteUriResolution,
}) => {
  // Path is effectively a pointer into entries
  const [path, setPath] = React.useState<number[]>([]);
  const [lastCol, lastRow = 0] = React.useMemo(
    () => [path.length - 1, ...path.slice(-1)],
    [path]
  );
  const [entries, setEntries] = React.useState<SchemaEntry[][]>([]);
  const activeEntry = React.useMemo(
    () => entries[path.length - 1]?.[lastRow],
    [path, lastRow, entries]
  );

  React.useEffect(() => {
    Promise.all(
      Object.entries(schemas).map((entry, idx) =>
        buildSchemaEntry({
          entry,
          idx,
          derefOptions: {
            unsafeAllowRemoteUriResolution,
          },
        })
      )
    )
      .then((column) => {
        setEntries([column]);
        setPath([]);
      })
      .catch(console.error);
  }, [schemas, unsafeAllowRemoteUriResolution]);

  React.useEffect(() => {
    const selectedEntry = entries[lastCol]?.[lastRow];
    if (selectedEntry === undefined) return;
    buildSchemaEntries(selectedEntry)
      .then((column) => {
        if (!column.length) return;
        // We always want to show one more column than selected
        // -> entries.length >= path.length + 1
        setEntries((prev) => [...prev.slice(0, path.length), column]);
      })
      .catch(console.error);
  }, [path]);

  const generalColumns = React.useMemo(() => {
    return entries.map((entriesCol, col) => {
      const clickHandler = (entry: SchemaEntry) => () => {
        setPath((prev) => [...prev.slice(0, col), entry.idx ?? 0]);
      };

      return (
        <Column
          key={`col-${col}-${path[col - 1] ?? 0}`}
          idx={col}
          entries={entriesCol}
          selectedRow={path[col]}
          isLast={col === lastCol}
          focus={path.length > 0 && col === entries.length - 1}
          clickHandler={clickHandler}
        />
      );
    });
  }, [entries, setPath, path]);

  const handleKeyDown: React.KeyboardEventHandler = React.useCallback(
    getKeyDownHandler({entries, lastCol, lastRow, path, setPath}),
    [entries, lastCol, lastRow, path, setPath]
  );

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Columns tabIndex={0} onKeyDown={handleKeyDown}>
          {generalColumns}
        </Columns>
        {activeEntry && <Info entry={activeEntry} />}
      </InnerWrapper>
      <Breadcrumbs
        entries={path.map((row, col) => entries[col][row])}
        setPath={setPath}
      />
    </OuterWrapper>
  );
};

/**
 * What if OSX Finder could browse JSONSchema
 */
export const Finder: React.VFC<FinderProps> = (props) => {
  return (
    <div>
      <InternalFinder {...props} />
    </div>
  );
};
