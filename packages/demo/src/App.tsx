import React from 'react';
import './App.css';
import { Finder, FinderProps } from './dist';
import schema from './test-schema.json';
import type { JSONSchema7 } from 'json-schema';

function App() {
  const props: FinderProps = {
    schemas: {
      fds: schema as JSONSchema7,
    },
  };

  return (
    <div className="App">
      <Finder {...props} />
    </div>
  );
}

export default App;
