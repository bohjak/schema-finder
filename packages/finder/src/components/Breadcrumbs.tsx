import React from "react";
import {
  Breadcrumb,
  BreadcrumbsWrapper,
  SchemaEntry,
  showName,
} from "./internal";

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
    <BreadcrumbsWrapper>
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
    </BreadcrumbsWrapper>
  );
};
