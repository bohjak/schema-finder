import React from "react";
import styled from "styled-components";
import {CleanButton, SchemaEntry} from "./internal";

const BreadcrumbWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border: thin black solid;
  overflow-x: auto;
`;

const Breadcrumb = styled(CleanButton)`
  cursor: pointer;
  padding: 0.1em 0.6em;
  position: relative;
  display: flex;
  align-items: center;

  &::after {
    content: "";
    --tri-height: 5px;
    border-left: var(--tri-height) #0003 solid;
    border-top: var(--tri-height) transparent solid;
    border-bottom: var(--tri-height) transparent solid;
    width: 0;
    height: 0;
    position: absolute;
    right: -3px;
  }

  &:last-of-type::after {
    display: none;
  }

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

export interface BreadcrumbsProps {
  path: SchemaEntry[];
  setPath: (value: React.SetStateAction<SchemaEntry[]>) => void;
}

export const Breadcrumbs: React.VFC<BreadcrumbsProps> = ({path, setPath}) => {
  if (!path.length) return null;

  return (
    <BreadcrumbWrapper>
      {path.map(({key, name}, idx) => {
        const handler = () => {
          setPath((prev) => prev.slice(0, idx + 1));
        };

        return (
          <Breadcrumb key={`bc-${idx}-${key}`} onClick={handler}>
            {name}
          </Breadcrumb>
        );
      })}
    </BreadcrumbWrapper>
  );
};
