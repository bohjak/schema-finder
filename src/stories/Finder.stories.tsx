import React from 'react';
import { Meta } from '@storybook/react';
import {Finder} from '../internal';
import fds from './assets/fds.json';
import i18n from './assets/i18n.json';
import config from './assets/config.json';

export default {
  component: Finder,
  title: 'Schemas/Finder'
} as Meta;

export const SingleSchema: React.VFC = () => <Finder schemas={{'fds': fds as any}} />

export const MultipleSchemas: React.VFC = () => <Finder schemas={{'fds': fds as any, 'i18n': i18n as any, 'config': config as any}} />
