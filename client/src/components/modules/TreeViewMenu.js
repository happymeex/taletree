import React from "react";
import { useState } from "react";
import "./TreeViewMenu.css";
import menuUp from "../../public/menu_up.svg";
import menuDown from "../../public/menu_down.svg";

const TreeViewMenu = React.memo((props) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div id="TreeViewMenu" className="TreeViewMenu-container u-bringToFront">
      <div className="TreeViewMenu-bar u-flex-alignCenter u-flex-justifyCenter ">
        <span>Menu</span>
        <div
          style={{ backgroundImage: isOpen ? `url(${menuDown})` : `url(${menuUp})` }}
          className="TreeViewMenu-arrowWrapper"
          onClick={() => {
            setIsOpen((state) => !state);
          }}
        ></div>
      </div>
      {isOpen && <div className="TreeViewMenu-buttonContainer">{props.children}</div>}
    </div>
  );
});

export default TreeViewMenu;
