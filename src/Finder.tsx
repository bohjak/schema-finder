import type { JSONSchema7 } from 'json-schema';
import React from 'react';
import styled from 'styled-components';
import {
  Breadcrumbs,
  Column,
  ColumnWrapper,
  Info,
  isComplexKey,
  isValidationKeyword,
  PathProvider,
  Property,
  SchemaProvider,
  usePath,
  useSchema
} from './internal';

export interface FinderProps {
  /** Key/Value store; Key used for display name */
  readonly schemas: Record<string, JSONSchema7>;
}

const OuterWrapper = styled.div`
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const InnerWrapper = styled.div`
display: flex;
  flex-flow: row nowrap;
  border: thin black solid;
  font-size: 12px;
  height: 30em;
`

const Columns = styled.div`
  display: flex;
  flex-flow: row nowrap;
  flex: 2;
  overflow-x: auto;
`

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
    <OuterWrapper>
      <InnerWrapper>
        <Columns>
          <ColumnWrapper>{roots}</ColumnWrapper>
          {columns}
        </Columns>
        <Info />
      </InnerWrapper>
      {!!path.length && <Breadcrumbs />}
    </OuterWrapper>
  );
};

/**
 * OSX Finder-esque JSONSchema explorer
 */
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
