import React from "react";
import "./TreeViewSnippet.css";

/**
 * proptypes
 * @param {x: Number, y: Number} pos
 * @param {length: Number, width: Number} size
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} content
 * @param {Boolean} highlight
 * @param {Function} onClick
 */
const TreeViewSnippet = (props) => {
  console.log("box highlight");
  console.log(props.highlight);
  const style = {
    left: `${props.pos.x}px`,
    top: `${props.pos.y}px`,
    width: `${props.size.width}px`,
    height: `${props.size.height}px`,
    border: props.highlight ? `10px solid` : `0`,
  };
  return (
    <div className="TreeViewSnippet-container" style={style} onClick={props.onClick}>
      <div>{props.authorName}</div>
      <div>{props.content}</div>
    </div>
  );
};

export default TreeViewSnippet;
