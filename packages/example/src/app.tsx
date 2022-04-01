import React from "react";
import {Finder} from "schema-finder";
import meta from "./meta.json";

export const App: React.FC = () => {
  const [schemas, setSchemas] = React.useState({meta});
  const [remote, setRemote] = React.useState(false);
  const name = React.useRef(null);
  const schema = React.useRef(null);

  const addSchema: React.MouseEventHandler = () => {
    try {
      const key = name.current.value;
      const value = JSON.parse(schema.current.value);
      setSchemas((old) => ({
        ...old,
        [key]: value,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1>Schema Finder</h1>
      <section>
        <h3>Add a schema</h3>
        <label>
          Name: <input ref={name} name="name" type={"text"} />
        </label>
        <br />
        <label>
          Schema: <textarea ref={schema} name="schema" />
        </label>
        <br />
        <button onClick={addSchema}>Add</button>
      </section>
      <hr />
      <section>
        <h3>Options</h3>
        <label>
          Allow Remote URL Resolution:{" "}
          <input type="checkbox" onChange={() => setRemote((s) => !s)} />
        </label>
      </section>
      <hr />
      <section>
        <Finder schemas={schemas} unsafeAllowRemoteUriResolution={remote} />
      </section>
    </div>
  );
};
