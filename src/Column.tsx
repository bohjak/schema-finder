import React from 'react';
import styled from 'styled-components';
import { isValidationKeyword, Property, useSchema } from './internal';

export const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  list-style: none;
  width: 15em;
  min-width: 15em;
  border-right: thin #0002 solid;
  overflow-y: auto;
  list-style-type: none;
  margin: 0;
  padding: 0;
`

export interface ColumnProps {
  childKeys: string[];
  path: string[];
  isComplex?: boolean;
}

export const Column: React.FC<ColumnProps> = ({
  childKeys,
  path,
  isComplex,
}) => {
  const { fromSchema } = useSchema();

  const createProp = (key: string) => {
    const itemPath = [...path, key];

    return (
      <Property key={'p-' + itemPath.join('.')} path={itemPath} hasChildren>
        <span style={{ fontStyle: 'italic' }}>{key}</span>
      </Property>
    );
  };

  const complexCreateProp = (key: string) => {
    const itemPath = [...path, key];

    const item = fromSchema(itemPath);
    const title = item.title || key;

    const hasChildren = !!Object.keys(item).filter(isValidationKeyword).length;

    return (
      <Property
        path={itemPath}
        key={'p-' + itemPath.join('.')}
        hasChildren={hasChildren}
      >
        {title}
      </Property>
    );
  };

  const listItems = childKeys.map(isComplex ? complexCreateProp : createProp);

  return (
    <ColumnWrapper id={path.join('-')}>
      {listItems}
    </ColumnWrapper>
  );
};
