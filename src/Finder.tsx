import React from "react";
import {
  addHasChildren,
  Breadcrumbs,
  ClickHandler,
  Columns,
  ColumnWrapper,
  CommonRowProps,
  derefEntry,
  getColId,
  EntryIcon,
  EntryName,
  Info,
  InnerWrapper,
  JSONSchema7,
  makeDeref,
  OuterWrapper,
  PropertyWrapper,
  renderRows,
  RowGroup,
  Schema,
  SchemaEntry,
  toSchemaEntry,
} from "./internal";

export interface FinderProps {
  /** Key/Value store; Key used for display name */
  readonly schemas: Record<string, JSONSchema7>;
}

const InternalFinder: React.VFC<FinderProps> = ({schemas}) => {
  const [activeSchema, setSchema] = React.useState<JSONSchema7>();
  const [path, setPath] = React.useState<SchemaEntry[]>([]);

  const dereference = React.useCallback(makeDeref(activeSchema), [
    activeSchema,
  ]);
  const [activeEntry] = React.useMemo(() => path.slice(-1), [path]);

  const rootSchemaEntries = React.useMemo(() => {
    return Object.entries(schemas)
      .map(toSchemaEntry)
      .map((e) => derefEntry(makeDeref(e.schema))(e))
      .map(addHasChildren);
  }, [schemas]);

  // Need to do this in a useEffect because `roots` are dependent on `path`
  React.useEffect(() => {
    if (rootSchemaEntries.length === 1) {
      const entry = rootSchemaEntries[0];
      setSchema(entry.schema);
      setPath([entry]);
    }
  }, [rootSchemaEntries]);

  // TODO: remove
  const roots = React.useMemo(
    () => {
      if (rootSchemaEntries.length === 1) {
        return null;
      }

      return (
        <ColumnWrapper>
          <RowGroup
            rows={rootSchemaEntries.map((entry, idx) => {
              const {key, schema, hasChildren} = entry;
              const inPath = path[0]?.key === key;
              const lastInPath = inPath && path.length === 1;

              return (
                <PropertyWrapper
                  key={`root-${idx}-${key}`}
                  hasChildren={hasChildren}
                  onClick={() => {
                    setSchema(schema);
                    setPath([entry]);
                  }}
                  inPath={inPath}
                  lastInPath={lastInPath}
                >
                  <EntryName>{key}</EntryName>
                  {hasChildren && <EntryIcon>&gt;</EntryIcon>}
                </PropertyWrapper>
              );
            })}
          />
        </ColumnWrapper>
      );
    },
    // TODO: would love to get rid of the dependency on path
    [path, rootSchemaEntries, setSchema, setPath]
  );

  // TODO: This needs to be completely reengineered.
  //       What I need is a global lazily evaluated (cached) AST-like tree.
  //       Currently the entry data is completely managed by React in the DOM
  //       and parts of it are "borrowed" by the global path state.
  //       This prevents me from implementing a proper keyboard navigation,
  //       makes it more difficult to handle certain cases where the children
  //       nodes need to know what was in their parent (and vice versa), and is
  //       tightly bound to the display format (couldn't easily be adapted
  //       to render the whole schema).
  const columns = React.useMemo(
    () =>
      path.flatMap(({schema, key, hasChildren}, i) => {
        if (!hasChildren) return [];

        // Because the path is a collection of selected items from columns.
        // So the index of a column is always +1 from the index of the schema
        // in path it takes its data from.
        const colIdx = i + 1;

        const clickHandler: ClickHandler = (entry) => () => {
          setPath((prev) => [...prev.slice(0, colIdx), entry]);
        };

        const commonRowProps: CommonRowProps = {
          clickHandler,
          dereference,
          colIdx,
          path,
        };

        return [
          <Schema
            key={`col-${colIdx}-${key}`}
            colIdx={colIdx}
            schema={schema}
            renderRowsWithProps={renderRows(commonRowProps)}
          />,
        ];
      }),
    [path, dereference, setPath]
  );

  React.useEffect(() => {
    if (!path.length) return;

    const lastColumn = document.querySelector(`#${getColId(path.length)}`);
    lastColumn?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
  }, [path]);

  const handleKeyDown: React.KeyboardEventHandler = React.useCallback((e) => {
    switch (e.key) {
      default: {
        return;
      }
      case "ArrowLeft": {
        setPath((prev) => prev.slice(0, prev.length - 1));
        break;
      }
      case "ArrowRight": {
        console.log("right");
        break;
      }
      case "ArrowUp": {
        console.log("up");
        break;
      }
      case "ArrowDown": {
        console.log("down");
        break;
      }
      case "Home": {
        setPath((prev) => prev.slice(0, 1));
        break;
      }
    }
    e.preventDefault();
  }, []);

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Columns tabIndex={0} onKeyDown={handleKeyDown}>
          {roots}
          {columns}
        </Columns>
        {activeEntry && <Info entry={activeEntry} />}
      </InnerWrapper>
      <Breadcrumbs path={path} setPath={setPath} />
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
