import React, { useState } from "react";
import "./Icons.css";

const Icon = ({ imageOn, imageOff, activeFunc }) => {
  const [active, setActive] = useState(false);
  return (
    <div
      style={{ backgroundImage: active ? `url(${imageOn})` : `url(${imageOff})` }}
      className="Icons"
      onClick={() => {
        setActive((state) => !state);
        activeFunc();
      }}
    ></div>
  );
};

export default Icon;
