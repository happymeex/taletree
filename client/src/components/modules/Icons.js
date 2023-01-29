import React, { useState } from "react";
import { DEFAULT_ICON_SIZE } from "../../utils/treeview.utils";
import "./Icons.css";

/**
 *
 * @param {Boolean} showByDefault determines whether to show icon. if icon is active, this is overridden.
 * @param {String} imgOn URL to the icon's active display state (e.g. red filled heart)
 * @param {String} imgOff URL to the icon's inactive display state (e.g. empty grey heart, like mine)
 * @param {Boolean} initialActive active/inactive state upon initial render
 * @param {Function} toggleActive handler for (in)activation (i.e. updates DB). takes current state (pre-click) as a parameter
 */
const Icon = ({ showByDefault, imgOn, imgOff, isActive, toggleActive, scale }) => {
  const [isHover, setIsHover] = useState(false);
  const [active, setActive] = useState(isActive);

  let iconStyle = {};
  if (isHover && !active) iconStyle["filter"] = `brightness(0.5)`;

  return showByDefault || active ? (
    <img
      src={active ? imgOn : imgOff}
      className="Icon else"
      style={iconStyle}
      onClick={() => {
        console.log("click?");
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
