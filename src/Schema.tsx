import React from 'react';
import { Property } from './Property';
import { isValidationKeyword } from './helpers';

export interface SchemaInterface {
  childKeys: string[];
  path: string[];
}

export const Schema: React.FC<SchemaInterface> = ({ childKeys, path }) => {
  const validationKeywords = childKeys
    .filter(isValidationKeyword)
    .map((key) => {
      const propPath = [...path, key];

      return (
        <Property key={propPath.join('.')} path={propPath} hasChildren>
          <span style={{ fontStyle: 'italic' }}>{key}</span>
        </Property>
      );
    });

  return <div className="Column">{...validationKeywords}</div>;
};
