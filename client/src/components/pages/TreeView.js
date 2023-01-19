import React from "react";
import { useState, useEffect } from "react";
import { get, post } from "../../utilities";

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippet_id
 * @param {String} userId
 */
const TreeView = (props) => {
  useEffect(() => {
    get("/api/treeview", { _id: props.snippet_id }).then((ret) => {
      console.log(ret);
    });
  }, []);

  return (
    <div>
      <div>Made it to the TreeView for snippet {props.snippet_id}</div>
      <div>User ID: {props.userId}</div>
    </div>
  );
};

export default TreeView;
