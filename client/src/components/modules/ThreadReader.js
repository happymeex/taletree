import React, { useEffect } from "react";
import "./ThreadReader.css";

/**
 * Popup displaying the content of a thread in plaintext form.
 *
 * @param {[String]} content list of snippet content to display
 */
const ThreadReader = ({ content }) => {
  const contentList = content.map((snippetText, i) => {
    return <div key={i}>{snippetText}</div>;
  });

  useEffect(() => {
    const reader = document.getElementById("ThreadReader");
    reader.scrollTo(0, reader.scrollHeight);
  });
  return (
    <div id="ThreadReader" className="ThreadReader-container u-flexColumn">
      {contentList}
    </div>
  );
};

export default ThreadReader;
