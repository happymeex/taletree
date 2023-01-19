import React from "react";
import { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { getCoords, getThread } from "../../utils/treeview.utils";
import TreeViewSnippet from "../modules/TreeViewSnippet";
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
 * @param {String} userId
 */
const TreeView = (props) => {
  const [pos, setPos] = useState({ x: 0, y: 0 }); //mouse position
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrag, setIsDrag] = useState(false);
  const [coords, setCoords] = useState({});
  const [snippets, setSnippets] = useState({});
  const [target, setTarget] = useState([props.snippetId]);
  const [thread, setThread] = useState();
  const [highlight, setHighlight] = useState(true);

  useEffect(() => {
    get("/api/treeview", { _id: props.snippetId }).then((ret) => {
      console.log(ret);
      let { rootId, tree } = ret;
      const initialCoords = getCoords(tree, rootId, props.snippetId);
      const initialThread = getThread(tree, props.snippetId);
      setCoords(initialCoords);
      setThread(initialThread);
      const { x, y } = initialCoords[props.snippetId];
      console.log("targetcoords:");
      console.log(x, y);

      for (const id in initialCoords) {
        console.log("initialCoords[id]:");
        console.log(initialCoords[id]);
        tree[id].pos = {
          x:
            0.5 * window.innerWidth +
            (HORIZONTAL_SPACING * (initialCoords[id].x - x) - 0.5 * DEFAULT_LENGTH) * DEFAULT_SCALE,
          y:
            0.5 * window.innerHeight +
            (VERTICAL_SPACING * (initialCoords[id].y - y) - 0.5 * DEFAULT_HEIGHT) * DEFAULT_SCALE,
        };
        tree[id].size = {
          width: DEFAULT_LENGTH * DEFAULT_SCALE,
          height: DEFAULT_HEIGHT * DEFAULT_SCALE,
        };

        //initialSnippets.push({
        //  id: id,
        //  pos: {
        //    x:
        //      0.5 * window.innerWidth +
        //      (HORIZONTAL_SPACING * (initialCoords[id].x - x) - 0.5 * DEFAULT_LENGTH) *
        //        DEFAULT_SCALE,
        //    y:
        //      0.5 * window.innerHeight +
        //      (VERTICAL_SPACING * (initialCoords[id].y - y) - 0.5 * DEFAULT_HEIGHT) * DEFAULT_SCALE,
        //  },
        //  size: { width: DEFAULT_LENGTH * DEFAULT_SCALE, height: DEFAULT_HEIGHT * DEFAULT_SCALE },
        //  authorName: ret.tree[id].authorName,
        //  authorId: ret.tree[id].authorId,
        //  content: ret.tree[id].content,
        //  highlight: false,
        //});
        //console.log("Snippet pos:");
        //console.log(initialSnippets[initialSnippets.length - 1].pos);
      }
      setSnippets(tree);
    });

    const updatePos = (e) => {
      setPos({ x: e.x, y: e.y });
    };
    window.addEventListener("mousemove", updatePos);
  }, []);

  useEffect(() => {
    if (isDrag) {
      setSnippets((tree) => {
        const delta = { dx: pos.x - startPos.x, dy: pos.y - startPos.y };
        console.log("delta:");
        console.log(delta);
        for (const id in tree) {
          tree[id].pos = {
            x: tree[id].pos.x + pos.x - startPos.x,
            y: tree[id].pos.y + pos.y - startPos.y,
          };
        }
        return tree;
        //return arr.map((snippetObj) => {
        // return snippetObj;
        //return {
        //  _id: snippetObj._id,
        //  size: snippetObj.size,
        //  authorName: snippetObj.authorName,
        //  authorId: snippetObj.authorId,
        //  content: snippetObj.content,
        //};
      });
      setStartPos(pos);
    }
  }, [pos]);

  const handleMouseDown = () => {
    setIsDrag(true);
    setStartPos(pos);
  };

  const handleMouseUp = () => {
    setIsDrag(false);
  };

  const handleSnippetClick = (id) => {
    console.log("set target id to " + id);
    setTarget(id);
    const newThread = getThread(snippets, id);
    console.log("new thread: ");
    console.log(newThread);
    setThread(newThread);
  };

  let snippetList = [];
  for (const id in snippets) {
    const s = snippets[id];
    snippetList.push(
      <TreeViewSnippet
        key={s._id}
        pos={s.pos}
        size={s.size}
        authorName={s.authorName}
        authorId={s.authorId}
        content={s.content}
        highlight={highlight && thread.has(s._id)}
        onClick={() => {
          console.log("clicked!");
          handleSnippetClick(s._id);
        }}
      />
    );
  }

  return (
    <div className="TreeView-container" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div>Made it to the TreeView for snippet {props.snippetId}</div>
      <div>User ID: {props.userId}</div>
      <>{snippetList}</>
    </div>
  );
};

export default TreeView;
