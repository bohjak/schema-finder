import React from 'react';
import './App.css';
import { Column } from './Column';
import { usePath } from './use-path';
import { Info } from './Info';
import { useSchema } from './use-schema';
import { Property } from './Property';
import { Schema } from './Schema';
import {
  isSchemaObject,
  isSchemaArray,
  isComplexKey,
  isValidationKeyword,
} from './helpers';
import { Breadcrumbs } from './Breadcrumbs';

interface AppProps {}

function App({}: AppProps) {
  const [path] = usePath();
  const { fromSchema } = useSchema();

  React.useEffect(() => {
    if (!path.length) return;

    const lastColumn = document.querySelector(`#${path.join('-')}`);
    lastColumn?.scrollIntoView({ behavior: 'smooth' });
  }, [path]);

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

  return (
    <div className="App">
      <div className="Finder">
        <div className="Columns">
          <ul className="Column">
            <Property path={['root']} key="root" hasChildren>
              root
            </Property>
          </ul>
          {...columns}
        </div>
        <Info />
      </div>
      {!!path.length && <Breadcrumbs />}
    </div>
  );
}

export default App;
