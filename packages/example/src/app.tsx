import React from "react";
import {Finder, BetterFinder} from "schema-finder";
import meta from "./meta.json";
import fds from "./fds.json";

const dbg = (...message: any[]): void => {
  // @ts-expect-error `isProduction` gets dynamically injected by esbuild at compile time
  if (isProduction) return;
  console.debug("[DEBUG]", ...message);
};

/* STATE */

type Schemas = Record<string, any>;
interface Options {
  remote?: boolean;
  displayOld?: boolean;
  displayReset?: boolean;
  darkMode?: boolean;
}

interface State {
  schemas: Schemas;
  options: Options;
}

const initialState: State = {
  schemas: {fds, meta},
  options: {},
};

/* ACTIONS */

interface ActionStateSet {
  type: "stateSet";
  payload: State;
}

interface ActionSchemasSet {
  type: "schemasSet";
  payload: Schemas;
}

interface ActionSchemasUpdate {
  type: "schemasUpdate";
  payload: Schemas;
}

interface ActionOptionsSet {
  type: "optionsSet";
  payload: Options;
}

interface ActionOptionToggle {
  type: "optionToggle";
  payload: keyof Options;
}

type Action =
  | ActionStateSet
  | ActionSchemasSet
  | ActionSchemasUpdate
  | ActionOptionsSet
  | ActionOptionToggle;

type Reducer = React.Reducer<State, Action>;

/* MIDDLEWARE */

type Middleware = (r: Reducer) => Reducer;

const preserve: Middleware =
  (reducer) =>
  (...args) => {
    const state = reducer(...args);
    localStorage.setItem("state", JSON.stringify(state));
    return state;
  };

const logAction: Middleware = (reducer) => (prev, action) => {
  dbg(action);
  const next = reducer(prev, action);
  dbg("new state", next);
  return next;
};

/* REDUCER */

const reducer: Reducer = (prev, action) => {
  switch (action.type) {
    case "schemasSet": {
      return {...prev, schemas: action.payload};
    }

    case "schemasUpdate": {
      const next = {...prev, schemas: {...prev.schemas, ...action.payload}};
      for (const key of Object.keys(action.payload)) {
        if (next.schemas[key] == undefined) delete next.schemas[key];
      }
      return next;
    }

    case "optionsSet": {
      return {...prev, options: action.payload};
    }

    case "optionToggle": {
      const {payload: key} = action;
      return {...prev, options: {...prev.options, [key]: !prev.options[key]}};
    }

    case "stateSet": {
      return action.payload;
    }
  }
};

const [composedReducer] = [reducer].map(preserve).map(logAction);

/* APP */

export const App: React.FC = () => {
  const [state, dispatch] = React.useReducer(composedReducer, initialState);
  const name = React.useRef(null);
  const schema = React.useRef(null);

  const addSchema: React.MouseEventHandler = () => {
    try {
      const key = name.current.value;
      const value = schema.current.value
        ? JSON.parse(schema.current.value)
        : undefined;
      dispatch({type: "schemasUpdate", payload: {[key]: value}});
    } catch (e) {
      console.error(e);
    }
  };

  const toggleOption = (option: keyof Options) => () => {
    dispatch({type: "optionToggle", payload: option});
  };

  React.useEffect(() => {
    const localState = localStorage.getItem("state");
    if (!localState) return;

    try {
      dispatch({type: "stateSet", payload: JSON.parse(localState)});
    } catch (e) {
      console.error("couldn't restore state from session storage");
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    const {style} = document.documentElement;
    const {darkMode} = state.options;
    style.setProperty("--color-bg", darkMode ? "#1d1f21" : "white");
    style.setProperty("--color-fg", darkMode ? "#c5c8c6" : "#1d1f21");
  }, [state.options.darkMode]);

  return (
    <div className="AppWrapper">
      <h1>Schema Finder Demo</h1>

      <BetterFinder
        schemas={state.schemas}
        unsafeAllowRemoteUriResolution={state.options.remote}
      />

      {state.options.displayOld && (
        <Finder
          schemas={state.schemas}
          unsafeAllowRemoteUriResolution={state.options.remote}
        />
      )}

      <fieldset id="schemas">
        <legend>Add a Schema</legend>
        <label>
          Name:
          <br />
          <input ref={name} name="name" type={"text"} />
        </label>
        <label>
          Schema:
          <br />
          <textarea
            ref={schema}
            name="schema"
            placeholder="Leave empty to delete."
          />
        </label>
        <button onClick={addSchema}>+ Add</button>
      </fieldset>

      <fieldset id="options">
        <legend>Options</legend>
        <label>
          <input
            type="checkbox"
            onChange={toggleOption("remote")}
            checked={!!state.options.remote}
          />
          Allow Remote URL Resolution
        </label>
        <label>
          <input
            type="checkbox"
            onChange={toggleOption("displayOld")}
            checked={!!state.options.displayOld}
          />
          Display Old Finder
        </label>
        <label>
          <input
            type="checkbox"
            onChange={toggleOption("darkMode")}
            checked={!!state.options.darkMode}
          />
          Dark Mode
        </label>
        <label>
          <input
            type="checkbox"
            onChange={toggleOption("displayReset")}
            checked={!!state.options.displayReset}
          />
          Display Reset Button
        </label>
      </fieldset>

      {state.options.displayReset && (
        <button
          onClick={() => dispatch({type: "stateSet", payload: initialState})}
        >
          DANGER: Reset State and Clear Session Storage
        </button>
      )}
    </div>
  );
};
