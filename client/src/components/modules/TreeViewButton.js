import React from "react";
import "./TreeViewButton.css";

/**
 * proptypes
 * @param {String} text button label
 * @param {Function} onClick handler function for click
 */

const TreeViewButton = (props) => {
  return (
    <button
      className="TreeViewButton-button u-flex-alignCenter u-flex-justifyCenter"
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
};

export default TreeViewButton;
