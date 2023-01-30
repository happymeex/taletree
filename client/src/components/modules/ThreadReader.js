import React, { useEffect } from "react";
import Icon from "./Icons";
import sprout from "../../public/sprout.svg";
import leaf from "../../public/leaf.svg";
import "./ThreadReader.css";

/**
 * Popup displaying the content of a thread in plaintext form.
 *
 * @param {{settings: any, text: [String]}} content settings specifies reader's icon configuration;
 *    text is a list of strings representing the content to be displayed
 */
const ThreadReader = ({ content, goTo, popupHandlers }) => {
  const { settings, text } = content;
  const contentList = text.map((snippetText, i) => {
    return <div key={i}>{snippetText}</div>;
  });

  useEffect(() => {
    const reader = document.getElementById("ThreadReader");
    reader.scrollTo(0, reader.scrollHeight);
  });
  return (
    <div id="ThreadReader" className="ThreadReader-container u-flexColumn">
      <div className="ThreadReader-iconBar u-flex-end">
        {settings.openWriter && (
          <Icon
            showByDefault={true}
            imgOn={leaf}
            imgOff={leaf}
            desc={"Leaf"}
            isActive={false}
            toggleActive={settings.openWriter}
          />
        )}
        {settings.snippetId && (
          <Icon
            showByDefault={true}
            imgOn={sprout}
            imgOff={sprout}
            desc={"Sprout"}
            isActive={false}
            toggleActive={(c) => {
              popupHandlers.toggle("reader");
              goTo.treeView(settings.snippetId);
            }}
          />
        )}
      </div>
      <div className="ThreadReader-textContainer u-flexColumn">{contentList}</div>
    </div>
  );
};

export default ThreadReader;
