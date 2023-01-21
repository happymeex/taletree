import React from "react";
import { useState } from "react";
import "./TreeViewSnippetWriter.css";

/**
 * Window for creating a new snippet
 * proptypes
 * @param {Function} onPost
 * @param {Function} onClose
 */
const TreeViewSnippetWriter = (props) => {
  const [input, setInput] = useState("");

  const handleChange = (e) => {
    setInput(e.target.value);
  };
  return (
    <div className="TreeViewSnippetWriter-container u-bringToFront u-flexColumn u-flex-alignCenter">
      <div className="TreeViewSnippetWriter-header u-flex-spaceBetween u-flex-alignCenter">
        <h3>Add snippet</h3>
        <div onClick={props.onClose}>X</div>
      </div>
      <textarea
        className="TreeViewSnippetWriter-textbox"
        onChange={handleChange}
        placeholder="Write here!"
      ></textarea>
      <button
        disabled={input.length === 0}
        className="TreeViewSnippetWriter-postButton"
        onClick={() => {
          props.onPost(input);
          props.onClose();
        }}
      >
        Post
      </button>
    </div>
  );
};

export default TreeViewSnippetWriter;
