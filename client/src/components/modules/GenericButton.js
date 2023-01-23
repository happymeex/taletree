import React from "react";
import "./GenericButton.css";

/**
 * proptypes
 * @param {String} text button label
 * @param {Function} onClick handler function for click
 */

const GenericButton = ({ text, onClick, imgURL }) => {
  return (
    <button
      className="GenericButton-button u-flex-alignCenter u-flex-justifyCenter"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default GenericButton;
