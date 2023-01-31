import React, { useState } from "react";
import "./Icons.css";

const getTooltip = (desc, active) => {
  if (desc === "Sprout") return "View full tree";
  if (desc === "Leaf") return active ? "Close writer" : "Open writer";
  return (active ? "Saved" : "Save") + " to " + (desc === "Heart" ? "favorites" : "bookmarks");
};

/**
 *
 * @param {Boolean} showByDefault determines whether to show icon. if icon is active, this is overridden.
 * @param {String} imgOn URL to the icon's active display state (e.g. red filled heart)
 * @param {String} imgOff URL to the icon's inactive display state (e.g. empty grey heart, like mine)
 * @param {Boolean} initialActive active/inactive state upon initial render
 * @param {Function} toggleActive handler for (in)activation (i.e. updates DB). takes current state (pre-click) as a parameter
 * @param {String} desc description of the icon. used to determine the tooltip
 */
const Icon = ({ showByDefault, imgOn, imgOff, isActive, toggleActive, desc }) => {
  const [isHover, setIsHover] = useState(false);
  const [active, setActive] = useState(isActive);

  let iconStyle = {};
  if (isHover && !active) iconStyle["filter"] = `brightness(0.5)`;

  return showByDefault || active ? (
    <div className="Icon-wrapper u-flexColumn u-flex-alignCenter">
      <img
        className={"Icon else"}
        src={active ? imgOn : imgOff}
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
      <div className="Icon-tooltip">{getTooltip(desc, active)}</div>
    </div>
  ) : (
    <></>
  );
};

export default Icon;
