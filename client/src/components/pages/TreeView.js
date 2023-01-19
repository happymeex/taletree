import React from "react";
import { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { getCoords } from "../../utils/treeview.utils";
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
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    get("/api/treeview", { _id: props.snippetId }).then((ret) => {
      console.log(ret);
      const initialCoords = getCoords(ret, props.snippetId);
      setCoords(initialCoords);
      let initialSnippets = [];
      const { x, y } = initialCoords[props.snippetId];
      console.log("targetcoords:");
      console.log(x, y);
      console.log("window dimensions:");
      console.log(window.innerWidth + " " + window.innerHeight);

      for (const id in initialCoords) {
        console.log("initialCoords[id]:");
        console.log(initialCoords[id]);
        initialSnippets.push({
          id: id,
          pos: {
            x:
              0.5 * window.innerWidth +
              (HORIZONTAL_SPACING * (initialCoords[id].x - x) - 0.5 * DEFAULT_LENGTH) *
                DEFAULT_SCALE,
            y:
              0.5 * window.innerHeight +
              (VERTICAL_SPACING * (initialCoords[id].y - y) - 0.5 * DEFAULT_HEIGHT) * DEFAULT_SCALE,
          },
          size: { width: DEFAULT_LENGTH * DEFAULT_SCALE, height: DEFAULT_HEIGHT * DEFAULT_SCALE },
          authorName: ret.snippetList[id].authorName,
          authorId: ret.snippetList[id].authorId,
          content: ret.snippetList[id].content,
        });
        console.log("Snippet pos:");
        console.log(initialSnippets[initialSnippets.length - 1].pos);
      }
      setSnippets(initialSnippets);
    });

    const updatePos = (e) => {
      setPos({ x: e.x, y: e.y });
    };
    window.addEventListener("mousemove", updatePos);
  }, []);

  useEffect(() => {
    if (isDrag) {
      setSnippets((arr) => {
        return arr.map((snippetObj) => {
          const delta = { dx: pos.x - startPos.x, dy: pos.y - startPos.y };
          console.log("delta:");
          console.log(delta);
          return {
            id: snippetObj.id,
            pos: {
              x: snippetObj.pos.x + pos.x - startPos.x,
              y: snippetObj.pos.y + pos.y - startPos.y,
            },
            size: snippetObj.size,
            authorName: snippetObj.authorName,
            authorId: snippetObj.authorId,
            content: snippetObj.content,
          };
        });
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

  let snippetList = snippets.map((snippetObj) => {
    return (
      <TreeViewSnippet
        key={snippetObj.id}
        pos={snippetObj.pos}
        size={snippetObj.size}
        authorName={snippetObj.authorName}
        authorId={snippetObj.authorId}
        content={snippetObj.content}
      />
    );
  });

  return (
    <div className="TreeView-container" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div>Made it to the TreeView for snippet {props.snippetId}</div>
      <div>User ID: {props.userId}</div>
      <>{snippetList}</>
    </div>
  );
};

export default TreeView;
