import React from "react";
import "./TreeViewSnippet.css";
import { assembleStyle, getIconBarStyle } from "../../utils/treeview.utils";
import SingleSnippet from "./SingleSnippet.js";

/**
 * proptypes
 * @param {pos: Object, size: Object} container
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {String} authorName
 * @param {String} content
 * @param {String} _id
 * @param {Boolean} highlight
 * @param {Object} line object containing all position/sizing data for lines
 * @param {Boolean} inTargetThread
 * @param {Boolean} isTarget
 * @param {Function} onClick
 * @param {Number} scale
 * @param {String} viewerId
 * @param {{isFavorite: Boolean, isBookmark: Boolean}} status
 * @param {Function} updateLocalViewer handler function to update viewer's favs/bookmarks in the parent component's viewer state
 * @param {Object} goTo navigation functions
 */
const TreeViewSnippet = (props) => {
  const { highlight, inTargetThread, isTarget } = props;
  const containerStyle = assembleStyle(
    props.container,
    highlight && inTargetThread,
    undefined,
    props.scale
  );
  const upLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.up, highlight && inTargetThread, 1)
    : undefined;
  const horizontalLineFromParentStyle = props.line.fromParent
    ? assembleStyle(props.line.fromParent.horizontal, highlight && inTargetThread, 0)
    : undefined;
  const lineToChildStyle = props.line.toChild
    ? assembleStyle(props.line.toChild, highlight && inTargetThread && !isTarget, 1)
    : undefined;

  const snippetStyle = {
    scale: props.scale,
    containerStyle: containerStyle,
    iconBarStyle: getIconBarStyle(props.scale),
    onClick: props.onClick,
  };
  return (
    <>
      <SingleSnippet
        author={props.author}
        authorName={props.authorName}
        authorId={props.authorId}
        content={props.content}
        _id={props._id}
        showAuthor={true}
        viewerId={props.viewerId}
        showIconBar={true}
        treeStyle={snippetStyle}
        status={props.status}
        updateLocalViewer={props.updateLocalViewer}
        goTo={props.goTo}
      />
      {props.line.fromParent ? (
        <>
          <div style={upLineFromParentStyle}></div>
          <div style={horizontalLineFromParentStyle}></div>
        </>
      ) : (
        <></>
      )}
      {props.line.toChild ? <div style={lineToChildStyle}></div> : <></>}
    </>
  );
};

export default TreeViewSnippet;
