import React from "react";
import { useState, useEffect, useMemo } from "react";
import { get, post } from "../../utilities";
import {
  getCoords,
  getThread,
  convertToPosition,
  getDimensions,
  getIncomingLine,
  getOutgoingLine,
  getScaledDelta,
  ROOT,
  ZOOM_SENSITIVITY,
} from "../../utils/treeview.utils";
import TreeViewSnippet from "../modules/TreeViewSnippet";
import GenericButton from "../modules/GenericButton";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import TreeViewMenu from "../modules/TreeViewMenu";
import "./TreeView.css";

const ALLOW_DRAG = (classname) => {
  return (
    classname.startsWith("TreeView-") ||
    classname === "TreeViewSnippet-container" ||
    classname === "NavBar-container"
  );
};
const ALLOW_HIGHLIGHT = (classname) => {
  return (
    classname.startsWith("SingleSnippet-contentBox") ||
    classname.startsWith("SingleSnippet-authorName") ||
    classname === "WriteNewSnippet-textbox"
  );
};

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippetId
 * @param {String} userName
 * @param {String} userId
 */
const TreeView = (props) => {
  const [pos, setPos] = useState({ x: 0, y: 0 }); //mouse position
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrag, setIsDrag] = useState(false);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [coords, setCoords] = useState({});
  const [snippets, setSnippets] = useState();
  const [target, setTarget] = useState(props.snippetId); //the leaf snippet in the currently highlighted thread
  const [viewTarget, setViewTarget] = useState(props.snippetId); //the snippet assigned coordinates (0,0)
  const [thread, setThread] = useState();
  const [highlight, setHighlight] = useState(true);
  const [writer, setWriter] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    get("/api/treeview", { _id: props.snippetId }).then((tree) => {
      console.log("Treeview got: " + props.userName);
      console.log(tree);
      setCoords(getCoords(tree, props.snippetId));
      setThread(getThread(tree, props.snippetId));
      setSnippets(tree);
    });

    const updatePos = (e) => {
      setPos({ x: e.x, y: e.y });
    };
    window.addEventListener("mousemove", updatePos);
    window.addEventListener("click", (e) => {
      if (e.target.id === "ModalBackground") setWriter(false);
    });
  }, []);

  useEffect(() => {
    if (isDrag) {
      setDelta((d) => {
        d.x += pos.x - startPos.x;
        d.y += pos.y - startPos.y;
        return d;
      });
      setStartPos(pos);
    }
  }, [pos]);

  const handleMouseDown = (e) => {
    console.log("pos: " + pos.x + " " + pos.y);
    if (!ALLOW_HIGHLIGHT(e.target.className)) e.preventDefault();
    if (ALLOW_DRAG(e.target.className)) {
      setIsDrag(true);
      setStartPos(pos);
    }
  };

  const handleMouseUp = () => {
    setIsDrag(false);
  };

  const handleSnippetClick = (id) => {
    setTarget(id);
    const newThread = getThread(snippets, id);
    setThread(newThread);
  };

  const toggleSnippetWriter = () => {
    setWriter((state) => !state);
  };

  const handlePost = (input) => {
    console.log("posting snippet as " + props.userName + " with input:");
    console.log(input);
    post("/api/new-snippet", {
      authorName: props.userName,
      authorId: props.userId,
      parentId: target,
      input: input,
      treeId: snippets[target].treeId,
    }).then((s) => {
      //returned snippet object
      if (s._id) {
        let tree = structuredClone(snippets);
        tree[s._id] = s;
        tree[s.parentId].children.push(s._id);
        const newCoords = getCoords(tree, viewTarget);
        const newThread = getThread(tree, s._id);
        setCoords(newCoords);
        setSnippets(tree);
        setThread(newThread);
        setTarget(s._id);
      }
    });
  };

  const alignCurrentThread = () => {
    const newCoords = getCoords(snippets, target);
    const newThread = getThread(snippets, target);
    setThread(newThread);
    setDelta({ x: 0, y: 0 });
    setCoords(newCoords);
    setViewTarget(target);
  };

  const handleWheel = (e) => {
    const scaleRatio = 1 - Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
    console.log("scale ratio: " + scaleRatio);
    setDelta((d) => getScaledDelta(d, pos, scaleRatio));
    setScale((x) => scaleRatio * x);
  };

  let snippetList = [];
  for (const id in snippets) {
    const s = snippets[id];
    const pos = convertToPosition(coords[id], delta, scale);
    const size = getDimensions(scale);
    const line = {
      fromParent:
        s.parentId === ROOT
          ? undefined
          : getIncomingLine(pos, size, coords[id].x - coords[s.parentId].x, scale),
      toChild: s.children.length === 0 ? undefined : getOutgoingLine(pos, size, scale),
    };
    snippetList.push(
      <TreeViewSnippet
        key={id}
        container={{
          pos: pos,
          size: size,
        }}
        line={line}
        authorName={s.authorName}
        authorId={s.authorId}
        content={s.content}
        _id={s._id}
        highlight={highlight}
        isTarget={id === target}
        inTargetThread={thread.has(id)}
        onClick={() => {
          handleSnippetClick(id);
        }}
        scale={scale}
      />
    );
  }

  return (
    <div
      id="TreeViewContainer"
      className="TreeView-container u-flex-end"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <TreeViewMenu>
        {useMemo(
          () => (
            <>
              <GenericButton text="Write" onClick={toggleSnippetWriter} />
              <GenericButton text="Align" onClick={alignCurrentThread} />
            </>
          ),
          [snippets, target]
        )}
      </TreeViewMenu>
      <>{snippetList}</>
      {writer && (
        <ModalBackground
          onClose={() => {
            setWriter(false);
          }}
          children={<WriteNewSnippet onPost={handlePost} onClose={toggleSnippetWriter} />}
        />
      )}
    </div>
  );
};

export default TreeView;
