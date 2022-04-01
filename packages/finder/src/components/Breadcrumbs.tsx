import React from "react";
import styled from "styled-components";
import {CleanButton} from "./button";
import {SchemaEntry, showName} from "./internal";

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
  entries: SchemaEntry[];
  setPath: React.Dispatch<React.SetStateAction<number[]>>;
}

export const Breadcrumbs: React.VFC<BreadcrumbsProps> = ({
  entries,
  setPath,
}) => {
  if (!entries.length) return null;

  return (
    <BreadcrumbWrapper>
      {entries.map(({key, name}, idx) => {
        const handler = () => {
          setPath((prev) => prev.slice(0, idx + 1));
        };

        return (
          <Breadcrumb key={`bc-${idx}-${key}`} onClick={handler}>
            {showName(key) ? name : key}
          </Breadcrumb>
        );
      })}
    </BreadcrumbWrapper>
  );
};
