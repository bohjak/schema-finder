import React from "react";
import styled from "styled-components";
import {usePath} from "./internal";

const BreadcrumbWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border: thin black solid;
  overflow-x: auto;
`;

const Breadcrumb = styled.div`
  cursor: pointer;
  padding: 0.25em 0.5em;
  position: relative;
  display: flex;
  align-items: center;
  border-right: solid thin black;

  &:hover,
  &:focus {
    background: #0003;
  }

  &::before {
    content: ".";
  }

  &:first-child::before {
    content: "";
  }
`;

export const Breadcrumbs: React.FC = () => {
  const [path, setPath] = usePath();

  const crumbs = path.map((p, i) => (
    <Breadcrumb
      key={"b-" + i + path.join(".")}
      onClick={() => setPath(path.slice(0, i + 1))}
      tabIndex={0}
    >
      {p}
    </Breadcrumb>
  ));

  return <BreadcrumbWrapper>{crumbs}</BreadcrumbWrapper>;
};
