import styled, {css} from "styled-components";

export const OuterWrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InnerWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border: thin black solid;
  font-size: 12px;
  height: 30em;
`;

export const Columns = styled.div`
  display: flex;
  flex-flow: row nowrap;
  flex: 2;
  overflow-x: auto;
`;

export interface PropertyWrapperProps {
  readonly hasChildren?: boolean;
  readonly inPath?: boolean;
  readonly lastInPath?: boolean;
}

export const PropertyWrapper = styled.div<PropertyWrapperProps>`
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

export const BreadcrumbWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border: thin black solid;
  overflow-x: auto;
`;

export const Breadcrumb = styled.div`
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
`;

export const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  list-style: none;
  width: 15em;
  min-width: 15em;
  border-right: thin #0002 solid;
  overflow-y: auto;
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

export const InfoWrapper = styled.div`
  padding: 1em;
  border-left: thin black solid;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  overflow-y: auto;
  flex: 1;

  p {
    margin: 0;
  }
`;

export const Title = styled.p`
  font-weight: bold;
  font-size: 1.5em;
`;

export const Type = styled.p`
  font-style: italic;
`;

export const Name = styled.span`
  font-weight: bold;
`;

export const Code = styled.code`
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
`;
