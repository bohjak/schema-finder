import {Meta} from "@storybook/react";
import React from "react";
import {Finder} from "../internal";
import {
  config,
  fds,
  hyperMeta,
  i18n,
  jsonSchema7,
  linksMeta,
  meta,
  niem,
  person,
  shopSelection,
} from "./schemas";

export default {
  component: Finder,
  title: "Schemas/Finder",
} as Meta;

export const SingleSchema: React.VFC = () => (
  <Finder schemas={{fds: fds as any}} />
);

export const MultipleSchemas: React.VFC = () => (
  <Finder
    schemas={
      {
        config,
        fds,
        hyperMeta,
        i18n,
        jsonSchema7,
        linksMeta,
        meta,
        niem,
        person,
        shopSelection,
      } as any
    }
  />
);
