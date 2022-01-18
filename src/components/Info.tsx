import React from "react";
import {
  Code,
  Divider,
  ErrBound,
  InfoWrapper,
  JSONSchema7,
  JSONSchema7Type,
  Name,
  SchemaEntry,
  Title,
  transformMd,
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
            <Code>{JSON.stringify(ex, null, "\t")}</Code>
          </p>
        ))
      ) : typeof examples === "object" ? (
        <p>
          <Code>{JSON.stringify(examples, null, "\t")}</Code>
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
  sConst: JSONSchema7["const"];
  sEnum: JSONSchema7["enum"];
}

const Value: React.VFC<ValueProps> = ({sConst, sEnum}) => {
  const vs: JSONSchema7Type[] = [];
  if (sConst) vs.push(sConst);
  if (sEnum) vs.push(...sEnum);

  if (!vs.length) return null;

  const displayValues = vs.map((v) => `"${v}"`).join(", ");

  return (
    <p>
      <Name>Value:</Name> {vs.length > 1 && <i>(oneOf)</i>} {displayValues}
    </p>
  );
};

export interface InfoProps {
  readonly entry: SchemaEntry;
}

export const Info: React.VFC<InfoProps> = ({entry}) => {
  const {name, schema, isRequired, path: entryPath} = entry;
  // Everything that comes from the schema can and will be of the wrong type
  const {
    description,
    type,
    enum: sEnum,
    const: sConst,
    examples,
    required,
  } = schema;

  return (
    <ErrBound>
      <InfoWrapper>
        <Title>{name}</Title>
        {isRequired && (
          <p>
            <i>Required</i>
          </p>
        )}
        <ErrBound>{description && transformMd(description)}</ErrBound>
        <Divider />
        <ErrBound>
          <Value sConst={sConst} sEnum={sEnum} />
        </ErrBound>
        <ErrBound>
          {type && (
            <p>
              <Name>Type:</Name> {Array.isArray(type) ? type.join(", ") : type}
            </p>
          )}
        </ErrBound>
        <ErrBound>
          {required && (
            <p>
              <Name>Required Properties:</Name> {required.join(", ")}
            </p>
          )}
        </ErrBound>
        <ErrBound>
          <Examples examples={examples} />
        </ErrBound>
        <Divider />
        {!!entryPath?.length && (
          <p>
            {/* TODO: replace the zero-width space with a proper CSS solution */}
            <Name>Full Path:</Name> {entryPath.join("\u200B.")}
          </p>
        )}
      </InfoWrapper>
    </ErrBound>
  );
};
