import type {JSONSchema7} from "json-schema";
import React from "react";
import styled from "styled-components";
import {isSchemaObject, usePath, useSchema} from "./internal";

const InfoWrapper = styled.div`
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

const Title = styled.p`
  font-weight: bold;
  font-size: 1.5em;
`;

const Type = styled.p`
  font-style: italic;
`;

const Name = styled.span`
  font-weight: bold;
`;

const Code = styled.code`
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
`;

export const Info: React.FC = () => {
  const [path] = usePath();
  const {fromSchema} = useSchema();

  const key = path.slice(-1)[0];

  let item: Partial<JSONSchema7> = {};
  if (!isSchemaObject(key)) {
    item = fromSchema(path);
  }

  const {
    title = key,
    description,
    type,
    enum: ienum,
    examples,
    required,
  } = item;

  console.log("examples", examples);

  const renderExamples = (examples: JSONSchema7["examples"]) => {
    if (!examples) return null;

    if (Array.isArray(examples))
      return examples.map((e) => (
        <p>
          <Code>{JSON.stringify(e)}</Code>
        </p>
      ));

    if (typeof examples === "object")
      return (
        <p>
          <Code>{JSON.stringify(examples)}</Code>
        </p>
      );

    return (
      <p>
        <Code>examples</Code>
      </p>
    );
  };

  return (
    <InfoWrapper>
      {title && <Title>{title}</Title>}
      {type && <Type>{Array.isArray(type) ? type.join(", ") : type}</Type>}
      {description && <p className="InfoDescription">{description}</p>}
      {ienum && (
        <p>
          <Name>Value(s):</Name> {ienum.join(", ")}
        </p>
      )}
      {required && (
        <p>
          <Name>Required Properties:</Name> {required.join(", ")}
        </p>
      )}
      {examples && (
        <>
          <p>
            <Name>Examples:</Name>
          </p>
          {renderExamples(examples)}
        </>
      )}
    </InfoWrapper>
  );
};
