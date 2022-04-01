import styled from "styled-components";

export const CleanButton = styled.button`
  outline: 0;
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;

  background: transparent;

  color: inherit;
  font: inherit;

  line-height: normal;

  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;

  -webkit-appearance: none;

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
  &:focus:not(:-moz-focusring) {
    outline: none;
  }
`;
