import React from "react";
import { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import {
  getCoords,
  getThread,
  convertToPosition,
  getDimensions,
  getIncomingLine,
  getOutgoingLine,
} from "../../utils/treeview.utils";
import TreeViewSnippet from "../modules/TreeViewSnippet";
import TreeViewButton from "../modules/TreeViewButton";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import "./TreeView.css";

const DEFAULT_LENGTH = 3.5;
const DEFAULT_HEIGHT = 1.5;
const DEFAULT_SCALE = 100;
const HORIZONTAL_SPACING = 4.5;
const VERTICAL_SPACING = 2;
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
      console.log("Logged in as: " + props.userName);
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
    if (isDrag && !writer) {
      setDelta((d) => {
        d.x += pos.x - startPos.x;
        d.y += pos.y - startPos.y;
        return d;
      });
      setStartPos(pos);
    }
  }, [pos]);

  const handleMouseDown = (e) => {
    if (e.target.id === "TreeViewContainer") {
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
    console.log("posting snippet with input:");
    console.log(input);
    post("/api/treeview", {
      authorName: props.userName,
      authorId: props.userId,
      parentId: target,
      input: input,
      rootId: snippets[target].rootId,
    }).then((s) => {
      //returned snippet object
      console.log("got back new snippet:");
      console.log(s);
      if (s._id) {
        console.log("setting snippet");
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

  const centerCurrentThread = () => {
    const newCoords = getCoords(snippets, target);
    const newThread = getThread(snippets, target);
    setThread(newThread);
    setDelta({ x: 0, y: 0 });
    setCoords(newCoords);
    setViewTarget(target);
  };

  let snippetList = [];
  for (const id in snippets) {
    const s = snippets[id];
    const pos = convertToPosition(coords[id], delta);
    const size = getDimensions(scale);
    const line = {
      fromParent:
        s.parentId === ""
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
        highlight={highlight}
        isTarget={id === target}
        inTargetThread={thread.has(id)}
        onClick={() => {
          handleSnippetClick(id);
        }}
      />
    );
  }
  //{writer && (
  //  <div id="ModalBackground" className="TreeView-modal u-flex-justifyCenter">
  //    <WriteNewSnippet onPost={handlePost} onClose={toggleSnippetWriter} />
  //  </div>
  //)}

  return (
    <div
      id="TreeViewContainer"
      className="TreeView-container u-flex-end"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="TreeView-optionsBarContainer u-flex-spaceBetween u-flex-alignCenter">
        <h1 className="u-bold u-bringToFront u-padded">TaleTree</h1>
        <div className="u-bringToFront u-flex-alignCenter">
          <TreeViewButton iconURL="Center Selected Thread" onClick={centerCurrentThread} />
          <TreeViewButton iconURL="Write" onClick={toggleSnippetWriter} />
        </div>
      </div>

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
