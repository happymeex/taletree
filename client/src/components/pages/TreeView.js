import React from "react";

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippet_id
 * @param {String} userId
 */
const TreeView = (props) => {
  return (
    <div>
      <div>Made it to the TreeView for snippet {props.snippet_id}</div>
      <div>User ID: {props.userId}</div>
    </div>
  );
};

export default TreeView;
