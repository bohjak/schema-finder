import React, { useRef } from 'react';
import { usePath } from './internal';

export interface PropertyProps {
  path: string[];
  hasChildren?: boolean;
  onClick?: () => void;
}

export const Property: React.FC<PropertyProps> = ({
  children,
  path,
  hasChildren,
  onClick,
}) => {
  const [curPath, setPath] = usePath();
  const ref = useRef<HTMLLIElement>(null);

  const i = path.length - 1;
  const key = path.slice(-1)[0];

  const inPath = curPath[i] === key;
  const last = curPath.length === path.length;

  // TODO: this could and should be done better
  //       Problems with the initial implementation:
  //       - doesn't solve recursive case (more than one level of single child)
  //       - prevents selecting the parent
  //       - prevents displaying info about the skipped stages
  // const { fromSchema } = useSchema();
  // const childKeys = Object.keys(fromSchema(path)).filter(canSkip);
  // const oneChild = childKeys.length === 1;
  // const onClick = () => oneChild ? setPath([...path, childKeys[0]]) : setPath(path);

  return (
    <li
      className={`Property${
        inPath ? (last ? ' PropertyPathLast' : ' PropertyPath') : ''
      }${hasChildren ? ' PropertyHasChildren' : ''}`}
      onClick={() => {
        setPath(path);
        onClick?.();
      }}
      tabIndex={0}
      ref={ref}
    >
      {children}
    </li>
  );
};
