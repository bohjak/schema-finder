import {Meta} from "@storybook/react";
import React from "react";
import {Finder} from "../internal";
import {
  fds,
  fdsNeu,
  githubAction,
  hyperMeta,
  i18n,
  jsonSchema7,
  linksMeta,
  meta,
  niem,
  person,
  rootRef,
  shopSelection,
  stressTest,
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
        fds,
        fdsNeu,
        githubAction,
        hyperMeta,
        i18n,
        jsonSchema7,
        linksMeta,
        meta,
        niem,
        person,
        rootRef,
        shopSelection,
        stressTest,
      } as any
    }
  />
);
