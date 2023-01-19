import React from "react";
import "./TreeViewSnippet.css";

/**
 * proptypes
 * @param {x: Number, y: Number} pos
 * @param {length: Number, width: Number} size
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} content
 */
const TreeViewSnippet = (props) => {
  return (
    <div
      className="TreeViewSnippet-container"
      style={{
        left: `${props.pos.x}px`,
        top: `${props.pos.y}px`,
        width: `${props.size.width}px`,
        height: `${props.size.height}px`,
      }}
    >
      <div>{props.authorName}</div>
      <div>{props.content}</div>
    </div>
  );
};

export default TreeViewSnippet;
