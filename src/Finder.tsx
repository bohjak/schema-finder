import {JSONSchema7} from "json-schema";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbWrapper,
  cleverDeepGet,
  ClickHandler,
  Columns,
  ColumnWrapper,
  getColId,
  InnerWrapper,
  OuterWrapper,
  PropertyWrapper,
  Schema,
  SmartPath,
} from "./internal";

export interface FinderProps {
  /** Key/Value store; Key used for display name */
  readonly schemas: Record<string, JSONSchema7>;
}

const InternalFinder: React.VFC<FinderProps> = ({schemas}) => {
  const [activeSchema, setSchema] = React.useState<JSONSchema7>();
  const [path, setPath] = React.useState<SmartPath>([]);

  const roots = React.useMemo(
    () =>
      Object.entries(schemas).map((entry, idx) => {
        const [key, schema] = entry;

        const inPath = path[0]?.[0] === key;
        const lastInPath = inPath && path.length === 1;

        return (
          <PropertyWrapper
            key={`root-${idx}-${key}`}
            hasChildren
            onClick={() => {
              console.log("Reset", key, schema);
              setSchema(schema);
              setPath([entry]);
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

  const fromSchema = React.useCallback(cleverDeepGet(activeSchema), [
    activeSchema,
  ]);

  const columns = path.map(([name, value], idx) => {
    const handler: ClickHandler = (entry) => () => {
      console.log("Set Path", entry, idx, path);
      setPath((prev) => [...prev.slice(0, idx + 1), entry]);
    };

    return (
      <Schema
        key={`col-${idx}-${name}`}
        fromSchema={fromSchema}
        path={path}
        schema={value}
        clickHandler={handler}
        idx={idx + 1}
      />
    );
  });

  const breadcrumbs = path.map(([name], idx) => {
    const handler = () => {
      console.log("Set Path (Breadcrumb)", idx, name);
      setPath((prev) => prev.slice(0, idx + 1));
    };

    return (
      <Breadcrumb key={`bc-${idx}-${name}`} onClick={handler}>
        {name}
      </Breadcrumb>
    );
  });

  React.useEffect(() => {
    console.log("Scroll To", getColId(path.length));

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
      </InnerWrapper>
      <BreadcrumbWrapper>{breadcrumbs}</BreadcrumbWrapper>
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
