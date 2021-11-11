import React from 'react';
import { useSchema } from './use-schema';
import { usePath } from './use-path';
import { isSchemaObject } from './helpers';
import type { JSONSchema7 } from 'json-schema';

export const Info: React.FC = () => {
  const [path] = usePath();
  const { fromSchema } = useSchema();

  const key = path.slice(-1)[0];

  let item: Partial<JSONSchema7> = {};
  if (!isSchemaObject(key)) {
    item = fromSchema(path);
  }

  console.log(item);

  const { title = key, description, type, enum: ienum, examples } = item;

  return (
    <div className="Info">
      {title && <p className="InfoTitle">{title}</p>}
      {type && (
        <p className="InfoType">
          {Array.isArray(type) ? type.join(', ') : type}
        </p>
      )}
      {description && <p className="InfoDescription">{description}</p>}
      {ienum && (
        <p className="InfoEnum">
          <span className="Name">Value(s):</span> {ienum.join(', ')}
        </p>
      )}
      {examples && (
        <p className="InfoExamples">
          <span className="Name">Examples:</span> {JSON.stringify(examples)}
        </p>
      )}
    </div>
  );
};
