import React from "react";
import { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import { getCoords } from "../../utils/treeview.utils";

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippetId
 * @param {String} userId
 */
const TreeView = (props) => {
  useEffect(() => {
    get("/api/treeview", { _id: props.snippetId }).then((ret) => {
      console.log(ret);
      const coords = getCoords(ret, props.snippetId);
      console.log(coords);
    });
  }, []);

  return (
    <div>
      <div>Made it to the TreeView for snippet {props.snippetId}</div>
      <div>User ID: {props.userId}</div>
    </div>
  );
};

export default TreeView;
