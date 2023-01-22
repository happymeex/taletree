import React from "react";
import "./ModalBackground.css";

/**
 * Darkened background for popups. Has an 'X' button in top right.
 *
 * @param children
 * @param {Function} onClose
 */
const ModalBackground = (props) => {
  return (
    <div id="ModalBackground" className="ModalBackground-container u-flex-justifyCenter">
      <div onClick={props.onClose} className="ModalBackground-closeButton">
        &times;
      </div>
      {props.children}
    </div>
  );
};

export default ModalBackground;
