import React from "react";
import styled, {css} from "styled-components";
import {usePath} from "./internal";

interface PropertyWrapperProps {
  readonly hasChildren?: boolean;
  readonly inPath?: boolean;
  readonly lastInPath?: boolean;
}

const PropertyWrapper = styled.div<PropertyWrapperProps>`
  margin: 0;
  padding: 0.25em 0.5em;

  &:hover,
  &:focus {
    cursor: pointer;
    background: #0003;
  }

  ${({hasChildren}) =>
    hasChildren &&
    css`
      &::after {
        content: ">";
        float: right;
      }
    `}

  ${({inPath}) =>
    inPath &&
    css`
      background: #0001;
    `}

  ${({lastInPath}) =>
    lastInPath &&
    css`
      color: white;
      font-weight: bold;

      background: #000a !important;
      cursor: default !important;
    `}
`;

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
    <PropertyWrapper
      hasChildren={hasChildren}
      inPath={inPath}
      lastInPath={inPath && last}
      onClick={() => {
        setPath(path);
        onClick?.();
      }}
      tabIndex={0}
    >
      {children}
    </PropertyWrapper>
  );
};
