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

const Row = styled.li`
  margin: 0;
  padding: 0.25em 0.5em;
`;

export const RowGroupTitle = styled(Row)`
  font-style: italic;
`;

export interface PropertyWrapperProps {
  readonly inPath?: boolean;
  readonly isKeyword?: boolean;
  readonly lastInPath?: boolean;
  readonly isRequired?: boolean;
}

export const PropertyWrapper = styled(Row)<PropertyWrapperProps>`
  margin: 0;
  padding: 0.25em 0.5em;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25em;
  overflow: hidden;

  font-style: ${({isKeyword}) => isKeyword && "italic"};

  &:hover,
  &:focus {
    cursor: pointer;
    background: #0003;
  }

  ${({inPath}) =>
    inPath &&
    css`
      background: #0001;
    `}

  ${({lastInPath}) =>
    lastInPath &&
    css`
      color: white;

      background: #000a !important;
      cursor: default !important;
    `}

  ${({isRequired}) =>
    isRequired &&
    css`
      font-weight: bold;
    `}
`;

export const EntryName = styled.span`
  text-overflow: ellipsis;
  flex: 1;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
`;

export const EntryIcon = styled.span``;

export const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.5em;

  width: 15em;
  min-width: 15em;
  border-right: thin #0002 solid;
  overflow-y: auto;
`;

export const RowGroupWrapper = styled.ul`
  display: flex;
  flex-direction: column;

  list-style: none;
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
  overflow-wrap: break-word;
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
  white-space: pre-wrap;
  tab-size: 2;
`;

export const Divider = styled.hr`
  width: 80%;
  color: #0002;
`;
