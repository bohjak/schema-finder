import type { JSONSchema7 } from 'json-schema';
import React from 'react';
import {
  Breadcrumbs,
  Column,
  Info,
  isComplexKey,
  isValidationKeyword,
  PathProvider,
  Property,
  SchemaProvider,
  usePath,
  useSchema,
} from './internal';
import './finder.css';

export interface FinderProps {
  readonly schemas: Record<string, JSONSchema7>;
}

const InternalFinder: React.FC<FinderProps> = ({ schemas }) => {
  const { setSchema, fromSchema } = useSchema();
  const [path] = usePath();

  const roots = Object.entries(schemas).map(([key, schema]) => (
    <Property
      path={[key]}
      key={key}
      hasChildren
      onClick={() => setSchema(schema)}
    >
      {key}
    </Property>
  ));

  const columns = path.flatMap((pItem, i, p) => {
    const colPath = p.slice(0, i + 1);
    const key = colPath.join('.');
    const item = fromSchema(colPath);

    const childKeys = Object.keys(item);

    if (isComplexKey(pItem)) {
      return [
        <Column
          key={'c-' + key}
          childKeys={childKeys}
          path={colPath}
          isComplex
        />,
      ];
    }

    return item &&
      (Array.isArray(item) || typeof item === 'object') &&
      (!item.type || item.type === 'array' || item.type === 'object')
      ? [
          <Column
            key={'c-' + key}
            childKeys={childKeys.filter(isValidationKeyword)}
            path={colPath}
          />,
        ]
      : [];
  });

  React.useEffect(() => {
    if (!path.length) return;

    const lastColumn = document.querySelector(`#${path.join('-')}`);
    lastColumn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
  }, [path]);

  return (
    <div className="FinderWrapper">
      <div className="Finder">
        <div className="Columns">
          <ul className="Column">{roots}</ul>
          {columns}
        </div>
        <Info />
      </div>
      {!!path.length && <Breadcrumbs />}
    </div>
  );
};

export const Finder: React.FC<FinderProps> = (props) => {
  return (
    <div>
      <PathProvider>
        <SchemaProvider>
          <InternalFinder {...props} />
        </SchemaProvider>
      </PathProvider>
    </div>
  );
};
