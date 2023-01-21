import React from "react";
import "./TreeViewButton.css";

/**
 * proptypes
 * @param {String} iconURL
 * @param {Function} onClick
 */

const TreeViewButton = (props) => {
  return (
    <button className="u-bringToFront TreeViewButton-button" onClick={props.onClick}>
      {props.iconURL}
    </button>
  );
};

export default TreeViewButton;
