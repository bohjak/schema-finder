import React from "react";
import {
  addHasChildren,
  Breadcrumb,
  BreadcrumbWrapper,
  ClickHandler,
  Columns,
  ColumnWrapper,
  CommonRowProps,
  getColId,
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
  const activeEntry = React.useMemo(() => path.slice(-1)[0], [path]);

  const rootSchemaEntries = React.useMemo(() => {
    return Object.entries(schemas).map(toSchemaEntry).map(addHasChildren);
  }, [schemas]);

  // Need to do this in a useEffect because `roots` are dependent on `path`
  React.useEffect(() => {
    if (rootSchemaEntries.length === 1) {
      const entry = rootSchemaEntries[0];
      setSchema(entry.schema);
      setPath([entry]);
    }
  }, [rootSchemaEntries]);

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
                  {key}
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

  const breadcrumbs = React.useMemo(
    () =>
      path.map(({key, name}, idx) => {
        const handler = () => {
          setPath((prev) => prev.slice(0, idx + 1));
        };

        return (
          <Breadcrumb key={`bc-${idx}-${key}`} onClick={handler}>
            {name}
          </Breadcrumb>
        );
      }),
    [path, setPath]
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

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Columns>
          {roots}
          {columns}
        </Columns>
        {activeEntry && <Info entry={activeEntry} />}
      </InnerWrapper>
      {!!breadcrumbs.length && (
        <BreadcrumbWrapper>{breadcrumbs}</BreadcrumbWrapper>
      )}
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
