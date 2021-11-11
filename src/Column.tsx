import React from 'react';
import { isValidationKeyword, Property, useSchema } from './internal';

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
    <ul className="Column" id={path.join('-')}>
      {listItems}
    </ul>
  );
};
