import {JSONSchema7Definition} from "json-schema";
import React from "react";
import {
  ColumnWrapper,
  getColId,
  RenderRowsWithProps,
  RowGroupTitle,
  RowGroupWrapper,
} from "./internal";

export interface SchemaProps {
  /** Index of `schema` in `path` */
  readonly colIdx: number;
  readonly schema: JSONSchema7Definition;
  readonly renderRowsWithProps: RenderRowsWithProps;
}

export const Schema: React.VFC<SchemaProps> = (props) => {
  const {schema, colIdx, renderRowsWithProps} = props;

  if (!schema || typeof schema !== "object") return null;

  /**
   * IMPORTANT STUFF
   * - type: "object", "array", other
   * - properties: if type: "object"; additionalProperties etc.
   * - items: if type: "array"; additionalItems etc.
   * - anyOf, oneOf, allOf, not; (if, then, else)
   */

  // Conceptually, ObjectSchema and ArraySchema could be simplified
  // to basically always returning arrays of elements.
  // Difference between them is that they use different Schema properties
  // to generate them, and arrays should have the distinguishing feature
  // of prepending their row groups anyOf/oneOf/allOf according to need.

  // I don't need them to be components... And since they are then rendering
  // the rows with

  // *** DON'T BE AFRAID OF PROP DRILLING ***
  // I mean eventually I should come up with a better solution for performance
  // reasons, but that time is not now.
  // (Also that would require something like a custom renderer, so...)

  const {
    additionalItems = {},
    additionalProperties = {},
    allOf = [],
    anyOf = [],
    contains = {},
    else: sElse = {},
    if: sIf = {},
    items = [],
    not = {},
    oneOf = [],
    patternProperties = {},
    properties = {},
    propertyNames = {},
    then: sThen = {},
    required,
  } = schema;

  const renderRows = renderRowsWithProps(required);

  /* 6.5 */
  const propertyRows = renderRows(properties);
  const patternRows = renderRows(patternProperties);
  const addPropRows = renderRows({additionalProperties});
  const propNamesRows = renderRows({propertyNames});

  /* 6.4 */
  const itemRows = Array.isArray(items)
    ? renderRows(items)
    : renderRows({items});
  const addItemRows = renderRows({additionalItems});
  const containRows = renderRows({contains});

  /* 6.7 */
  const allRows = renderRows(allOf);
  const anyRows = renderRows(anyOf);
  const oneRows = renderRows(oneOf);
  const notRows = renderRows({not});

  /* 6.6 */
  const ifRows = renderRows({if: sIf});
  const thenRows = renderRows({then: sThen});
  const elseRows = renderRows({else: sElse});

  return (
    <ColumnWrapper id={getColId(colIdx)}>
      <RowGroup rows={propertyRows} />
      <RowGroup rows={patternRows} />
      <RowGroup rows={addPropRows} title="additionalProperties" />
      <RowGroup rows={propNamesRows} />

      <RowGroup rows={itemRows} />
      <RowGroup rows={addItemRows} title="additionalItems" />
      <RowGroup rows={containRows} />

      <RowGroup rows={allRows} title="allOf" />
      <RowGroup rows={anyRows} title="anyOf" />
      <RowGroup rows={oneRows} title="oneOf" />
      <RowGroup rows={notRows} />

      <RowGroup rows={ifRows} />
      <RowGroup rows={thenRows} />
      <RowGroup rows={elseRows} />
    </ColumnWrapper>
  );
};

export interface RowGroupProps {
  rows: JSX.Element[];
  title?: string;
}

export const RowGroup: React.VFC<RowGroupProps> = ({rows, title}) => {
  if (!rows.length) return null;

  return (
    <RowGroupWrapper>
      {title && <RowGroupTitle>{title}</RowGroupTitle>}
      {rows}
    </RowGroupWrapper>
  );
};
