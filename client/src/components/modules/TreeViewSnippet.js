import React from "react";
import "./TreeViewSnippet.css";
import { assembleStyle } from "../../utils/treeview.utils";
import SingleSnippet from "./SingleSnippet.js";

/**
 * proptypes
 * @param {pos: Object, size: Object} container
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} content
 * @param {String} _id
 * @param {Boolean} highlight
 * @param {Object} line object containing all position/sizing data for lines
 * @param {Boolean} inTargetThread
 * @param {Boolean} isTarget
 * @param {Function} onClick
 */
const TreeViewSnippet = (props) => {
  const { highlight, inTargetThread, isTarget } = props;
  const containerStyle = assembleStyle(props.container, highlight && inTargetThread);
  const upLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.up, highlight && inTargetThread, true)
    : undefined;
  const horizontalLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.horizontal, highlight && inTargetThread, true)
    : undefined;
  const lineToChildStyle = props.line.toChild
    ? assembleStyle(props.line.toChild, highlight && inTargetThread && !isTarget, true)
    : undefined;

  return (
    <>
      {props.line.fromParent ? (
        <>
          <div style={upLineFromParentStyle}></div>
          <div style={horizontalLineFromParentStyle}></div>
        </>
      ) : (
        <></>
      )}
      {props.line.toChild ? <div style={lineToChildStyle}></div> : <></>}
      <SingleSnippet
        authorName={props.authorName}
        authorId={props.authorId}
        content={props.content}
        _id={props._id}
        isTreeView={true}
        showAuthor={true}
        isLiked={false}
        isBookmarked={false}
        showIconBar={true}
        style={containerStyle}
      />
    </>
  );
};

export default TreeViewSnippet;
