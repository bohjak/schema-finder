import React from "react";
import {
  Breadcrumbs,
  Column,
  Columns,
  Info,
  InnerWrapper,
  JSONSchema7,
  OuterWrapper,
  SchemaEntry,
  buildSchemaEntry,
  DerefOptions,
  buildSchemaEntries,
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
  const [lastPath] = React.useMemo(() => path.slice(-1), [path]);
  const [entries, setEntries] = React.useState<SchemaEntry[][]>([]);
  const activeEntry = React.useMemo(
    () => entries[path.length - 1]?.[lastPath],
    [path, lastPath, entries]
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
    const lastCol = entries[path.length - 1];
    const selectedRow = lastCol?.[lastPath];
    if (selectedRow === undefined) return;
    buildSchemaEntries(selectedRow)
      .then((column) => {
        if (!column.length) return;
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
          isLast={col === path.length - 1}
          focus={col === entries.length - 1}
          clickHandler={clickHandler}
        />
      );
    });
  }, [entries, setPath, path]);

  const handleKeyDown: React.KeyboardEventHandler = React.useCallback(
    (e) => {
      switch (e.key) {
        default: {
          return;
        }
        case "ArrowLeft": {
          setPath((prev) => prev.slice(0, -1));
          break;
        }
        case "ArrowRight": {
          setPath((prev) => {
            if (prev.length === entries.length) return prev;
            return [...prev, 0];
          });
          break;
        }
        case "ArrowUp": {
          const [lastRow = 0] = path.slice(-1);
          const next = Math.max(lastRow - 1, 0);

          setPath((prev) => [...prev.slice(0, -1), next]);
          break;
        }
        case "ArrowDown": {
          if (!path.length) {
            setPath([0]);
            break;
          }

          const [lastRow] = path.slice(-1);
          const colLen = entries[path.length - 1].length;
          const next = Math.min(lastRow + 1, colLen - 1);

          setPath((prev) => [...prev.slice(0, -1), next]);
          break;
        }
        case "Home": {
          setPath((prev) => prev.slice(0, 1));
          break;
        }
      }
      e.preventDefault();
    },
    [setPath, path, entries]
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
 * OSX's Finder-esque JSONSchema explorer
 */
export const Finder: React.VFC<FinderProps> = (props) => {
  return (
    <div>
      <InternalFinder {...props} />
    </div>
  );
};
