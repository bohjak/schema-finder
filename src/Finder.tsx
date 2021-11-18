import {JSONSchema7} from "json-schema";
import React from "react";
import {makeDeref} from "./dereference";
import {Info} from "./Info";
import {
  addHasChildren,
  Breadcrumb,
  BreadcrumbWrapper,
  ClickHandler,
  Columns,
  ColumnWrapper,
  getColId,
  InnerWrapper,
  OuterWrapper,
  PropertyWrapper,
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

  const deref = React.useCallback(makeDeref(activeSchema), [activeSchema]);
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
          {rootSchemaEntries.map((entry, idx) => {
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
        </ColumnWrapper>
      );
    },
    // TODO: would love to get rid of the dependency on path
    [path, rootSchemaEntries, setSchema, setPath]
  );

  const columns = React.useMemo(
    () =>
      path.flatMap(({schema, key, hasChildren}, idx) => {
        if (!hasChildren) return [];

        const handler: ClickHandler = (entry) => () => {
          setPath((prev) => [...prev.slice(0, idx + 1), entry]);
        };

        return [
          <Schema
            key={`col-${idx}-${key}`}
            dereference={deref}
            path={path}
            schema={schema}
            clickHandler={handler}
            idx={idx + 1}
          />,
        ];
      }),
    [path, deref, setPath]
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
