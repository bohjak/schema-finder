import React from "react";
import {
  EntryIcon,
  EntryName,
  InfoWrapper,
  Md,
  Name,
  PropertyWrapper,
  Title,
} from "./components/internal";
import {
  Columns,
  ColumnWrapper,
  FinderProps,
  InnerWrapper,
  OuterWrapper,
  RowGroupWrapper,
} from "./internal";
import {parseJSONSchema7, SchemaNode, SchemaNodes} from "./parse";

interface BetterInfoProps {
  readonly selectedNode: SchemaNode;
}

const BetterInfo: React.VFC<BetterInfoProps> = ({selectedNode}) => {
  const {title, key, uri, description, valueType} = selectedNode;

  return (
    <InfoWrapper>
      <Title>{title ?? key}</Title>
      {description && <Md s={description} path={uri} />}
      <p>
        <Name>Type:</Name>{" "}
        {Array.isArray(valueType) ? valueType.join(", ") : valueType}
      </p>
      <p>
        <Name>Full Path:</Name> {uri}
      </p>
    </InfoWrapper>
  );
};

type SelectNode = (col: number, node: SchemaNode) => void;

interface BetterRowProps {
  readonly node: SchemaNode;
  readonly selectNode: SelectNode;
  readonly colIdx: number;
  readonly isSelected?: boolean;
  readonly isInPath?: boolean;
}

const BetterRow: React.VFC<BetterRowProps> = ({
  node,
  selectNode,
  colIdx,
  isSelected,
  isInPath,
}) => {
  const autofocus: React.RefCallback<HTMLElement> = React.useCallback(
    (el) => {
      if (isSelected) {
        el?.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
    },
    [isSelected]
  );

  return (
    <PropertyWrapper
      ref={autofocus}
      onClick={() => selectNode(colIdx + 1, node)}
      lastInPath={isSelected}
      inPath={isInPath}
    >
      <EntryName>{node.key}</EntryName>
      {Object.keys(node.children).length > 0 && <EntryIcon>&gt;</EntryIcon>}
    </PropertyWrapper>
  );
};

interface BetterColumnProps {
  readonly node: SchemaNode;
  readonly selectNode: SelectNode;
  readonly colIdx: number;
  readonly path: SchemaNode[];
  readonly selectedNode: SchemaNode;
  readonly focus?: boolean;
}

const BetterColumn: React.VFC<BetterColumnProps> = ({
  node,
  selectNode,
  colIdx,
  selectedNode,
  path,
  focus,
}) => {
  const rows = [];

  for (const key of Object.keys(node.children)) {
    // FIXME: selectedNode may be displayed more than once at the same time, causing multiple rows to be highlighted as selected
    rows.push(
      <BetterRow
        key={`row-${colIdx}-${key}`}
        node={node.children[key]}
        selectNode={selectNode}
        colIdx={colIdx}
        isSelected={node.children[key] === selectedNode}
        isInPath={node.children[key] === path[colIdx + 1]}
      />
    );
  }

  const autofocus: React.RefCallback<HTMLElement> = React.useCallback(
    (el) => {
      if (focus) {
        el?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "end",
        });
      }
    },
    [focus]
  );

  return rows.length ? (
    <ColumnWrapper id={`column-${colIdx}`} ref={autofocus}>
      {/* TODO: remove the group wrapper? */}
      <RowGroupWrapper>{rows}</RowGroupWrapper>
    </ColumnWrapper>
  ) : null;
};

interface InnerFinderProps {
  readonly root: SchemaNode;
}

const BetterInnerFinder: React.VFC<InnerFinderProps> = ({root}) => {
  // TODO: take state out of React to prevent unnecessary re-renders
  const [path, setPath] = React.useState([root]);
  const selectedNode = React.useMemo(() => path[path.length - 1], [path]);
  const selectedNodeSiblings = React.useMemo(() => {
    const siblings = path[path.length - 2]?.children;
    if (siblings == undefined) return undefined;
    return Object.values(siblings);
  }, [path]);
  const selectedNodeIdx = React.useMemo(
    () =>
      selectedNodeSiblings?.findIndex((sibling) => sibling === selectedNode) ??
      0,
    [selectedNode, selectedNodeSiblings]
  );

  const selectNode: SelectNode = (col, node) => {
    setPath((old) => [...old.slice(0, Math.max(1, col)), node]);
  };

  const columns = React.useMemo(() => {
    return path.map((node, colIdx) => (
      <BetterColumn
        key={`col-${colIdx}-${node.key}`}
        node={node}
        selectNode={selectNode}
        colIdx={colIdx}
        path={path}
        selectedNode={selectedNode}
        focus={path.length > 1}
      />
    ));
  }, [path]);

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    let flag;

    switch (e.key) {
      case "h":
      case "ArrowLeft":
        {
          if (path.length === 1) break;
          setPath((prev) => prev.slice(0, -1));
          flag = true;
        }
        break;

      case "l":
      case "ArrowRight":
        {
          const nextKey = Object.keys(selectedNode.children)[0];
          const nextNode = selectedNode.children[nextKey];
          if (nextNode == undefined) break;
          setPath((prev) => [...prev, nextNode]);
          flag = true;
        }
        break;

      case "k":
      case "ArrowUp":
        {
          const nextNode =
            selectedNodeSiblings?.[Math.max(0, selectedNodeIdx - 1)];
          if (nextNode == undefined) break;
          setPath((prev) => [...prev.slice(0, -1), nextNode]);
          flag = true;
        }
        break;

      case "j":
      case "ArrowDown":
        {
          const nextNode =
            selectedNodeSiblings?.[
              Math.min(selectedNodeSiblings.length - 1, selectedNodeIdx + 1)
            ];
          if (nextNode == undefined) break;
          setPath((prev) => [...prev.slice(0, -1), nextNode]);
          flag = true;
        }
        break;

      case "g":
        {
          const nextNode = selectedNodeSiblings?.[0];
          if (nextNode == undefined || nextNode == selectedNode) break;
          setPath((prev) => [...prev.slice(0, -1), nextNode]);
          flag = true;
        }
        break;

      case "G":
        {
          const nextNode =
            selectedNodeSiblings?.[selectedNodeSiblings.length - 1];
          if (nextNode == undefined || nextNode == selectedNode) break;
          setPath((prev) => [...prev.slice(0, -1), nextNode]);
          flag = true;
        }
        break;
    }

    if (flag) e.preventDefault();
  };

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Columns tabIndex={0} onKeyDown={handleKeyDown}>
          {columns}
          {columns.length > 1 && <ColumnWrapper />}
        </Columns>
        {columns.length > 1 && <BetterInfo selectedNode={selectedNode} />}
      </InnerWrapper>
      <div>Breadcrumbs...</div>
    </OuterWrapper>
  );
};

export const BetterFinder: React.VFC<FinderProps> = ({
  schemas,
  // unsafeAllowRemoteUriResolution,
}) => {
  const roots: SchemaNodes = {};
  const errs: Error[] = [];
  const nodes = {};

  for (const schemaName of Object.keys(schemas)) {
    // TODO: resolve remote references
    const root = parseJSONSchema7({
      errs,
      nodes,
      schema: schemas[schemaName],
      baseUri: `${schemaName}`,
    });

    root && (roots[schemaName] = root);
  }

  if (errs.length) {
    console.error(errs);
  }

  const root: SchemaNode = {
    uri: "",
    parents: {},
    children: roots,
    title: "Master Root Node",
    key: "root",
    valueType: "object",
  };

  return <BetterInnerFinder root={root} />;
};
