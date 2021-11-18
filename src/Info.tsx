import type {JSONSchema7, JSONSchema7Type} from "json-schema";
import React from "react";
import {
  Code,
  Divider,
  InfoWrapper,
  Name,
  SchemaEntry,
  Title,
  Type,
} from "./internal";

interface ExamplesProps {
  /**
   * This type is wrong.
   *
   * Should be `unknown[] | undefined`; see [RFC].
   *
   * [RFC]: https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.4
   */
  readonly examples: JSONSchema7["examples"];
}

const Examples: React.VFC<ExamplesProps> = ({examples}) => {
  if (!examples) return null;

  return (
    <>
      <p>
        <Name>Examples:</Name>
      </p>
      {Array.isArray(examples) ? (
        examples.map((ex) => (
          <p>
            <Code>{JSON.stringify(ex)}</Code>
          </p>
        ))
      ) : typeof examples === "object" ? (
        <p>
          <Code>{JSON.stringify(examples)}</Code>
        </p>
      ) : (
        <p>
          <Code>{examples}</Code>
        </p>
      )}
    </>
  );
};

interface ValueProps {
  value: JSONSchema7Type[];
}

const Value: React.VFC<ValueProps> = ({value}) => {
  if (!value.length) return null;

  return (
    <p>
      <Name>Value:</Name>{" "}
      {value.length === 1 ? (
        value[0]
      ) : (
        <>
          <i>oneOf:</i> {value.join(", ")}
        </>
      )}
    </p>
  );
};

export interface InfoProps {
  readonly entry: SchemaEntry;
}

export const Info: React.VFC<InfoProps> = ({entry}) => {
  const {name, schema, isRequired, path: entryPath} = entry;
  const {
    description,
    type,
    enum: sEnum,
    const: sConst,
    examples,
    required,
  } = schema;

  // TODO: Not sure this belongs here?
  const value: JSONSchema7Type[] = [];
  if (sConst) value.push(sConst);
  if (sEnum) value.push(...sEnum);

  return (
    <InfoWrapper>
      <Title>{name}</Title>
      {isRequired && (
        <p>
          <i>Required</i>
        </p>
      )}
      {entryPath && !!entryPath.length && (
        <p>
          <Name>Full Path:</Name> {entryPath.join(".")}
        </p>
      )}
      {description && <p>{description}</p>}
      <Divider />
      <Value value={value} />
      {type && (
        <p>
          <Name>Type:</Name> {Array.isArray(type) ? type.join(", ") : type}
        </p>
      )}
      {required && (
        <p>
          <Name>Required Properties:</Name> {required.join(", ")}
        </p>
      )}
      <Divider />
      <Examples examples={examples} />
    </InfoWrapper>
  );
};
