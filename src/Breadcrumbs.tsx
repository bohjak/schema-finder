import React from 'react';
import { usePath } from './internal';

export const Breadcrumbs: React.FC = () => {
  const [path, setPath] = usePath();

  const crumbs = path.map((p, i) => (
    <div
      className="Breadcrumb"
      key={'b-' + i + path.join('.')}
      onClick={() => setPath(path.slice(0, i + 1))}
      tabIndex={0}
    >
      {p}
    </div>
  ));

  return <div className="Breadcrumbs">{crumbs}</div>;
};
