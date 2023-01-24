import React, { useState } from "react";
import "./Icons.css";

/**
 *
 * @param {Boolean} showByDefault determines whether to show icon. if icon is active, this is overridden.
 * @param {String} imgOn URL to the icon's active display state (e.g. red filled heart)
 * @param {String} imgOff URL to the icon's inactive display state (e.g. empty grey heart, like mine)
 * @param {Boolean} initialActive active/inactive state upon initial render
 * @param {Function} toggleActive handler for (in)activation (i.e. updates DB). takes current active/inactive state as param
 */
const Icon = ({ showByDefault, imgOn, imgOff, initialActive, toggleActive }) => {
  const [active, setActive] = useState(initialActive);
  const [isHover, setIsHover] = useState(false);
  return showByDefault || active ? (
    <img
      src={active ? imgOn : imgOff}
      style={isHover ? { filter: `brightness(0.5)` } : {}}
      className="Icon else"
      onClick={() => {
        toggleActive(active);
        setActive((s) => !s);
      }}
      onMouseOver={() => {
        if (!active) setIsHover(true);
      }}
      onMouseOut={() => {
        setIsHover(false);
      }}
    ></img>
  ) : (
    <></>
  );
};

export default Icon;
