import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import schema from './test-schema.json';
import type { JSONSchema7 } from 'json-schema';
import { PathProvider } from './use-path';
import { SchemaProvider } from './use-schema';

ReactDOM.render(
  <React.StrictMode>
    <PathProvider>
      <SchemaProvider schema={schema as JSONSchema7}>
        <App />
      </SchemaProvider>
    </PathProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
