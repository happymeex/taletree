import React from "react";
import "./ModalBackground.css";

/**
 * Darkened background for popups. Has an 'X' button in top right.
 *
 * @param children
 * @param {Function} onClose
 */
const ModalBackground = (props) => {
  const clickHandler = (e) => {
    if (e.target.className.startsWith("ModalBackground")) props.onClose();
  };
  return (
    <div className="ModalBackground-container u-flex-justifyCenter" onClick={clickHandler}>
      <div onClick={props.onClose} className="ModalBackground-closeButton">
        &times;
      </div>
      {props.children}
    </div>
  );
};

export default ModalBackground;
