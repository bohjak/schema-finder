import {JSONSchema7} from "json-schema";
import React from "react";
import {makeDeref} from "./dereference";
import {Info} from "./Info";
import {
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

  const roots = React.useMemo(
    () =>
      Object.entries(schemas).map((entry, idx) => {
        const schemaEntry = toSchemaEntry(entry);
        const {key, schema} = schemaEntry;

        const inPath = path[0]?.key === key;
        const lastInPath = inPath && path.length === 1;

        return (
          <PropertyWrapper
            key={`root-${idx}-${key}`}
            hasChildren
            onClick={() => {
              console.log("Reset", key, schema);
              setSchema(schema);
              setPath([schemaEntry]);
            }}
            inPath={inPath}
            lastInPath={lastInPath}
          >
            {key}
          </PropertyWrapper>
        );
      }),
    // TODO: would love to get rid of the dependency on path
    [path, schemas, setSchema, setPath]
  );

  const columns = React.useMemo(
    () =>
      path.map(({schema, key}, idx) => {
        const handler: ClickHandler = (entry) => () => {
          setPath((prev) => [...prev.slice(0, idx + 1), entry]);
        };

        return (
          <Schema
            key={`col-${idx}-${key}`}
            dereference={deref}
            path={path}
            schema={schema}
            clickHandler={handler}
            idx={idx + 1}
          />
        );
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
          <ColumnWrapper>{roots}</ColumnWrapper>
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
