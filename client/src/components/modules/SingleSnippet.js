import React, { useEffect, useState } from "react";
import { Link } from "@reach/router";
import { navigate } from "@reach/router";
import "./SingleSnippet.css";
import Icon from "./Icons.js";
import menuUp from "../../public/menu_up.svg";
import heart from "../../public/heart.svg";
import bookmark from "../../public/bookmark_unmarked.svg";
import filledBookmark from "../../public/bookmark_marked.svg";
import filledHeart from "../../public/filled_heart.svg";
import "../../utilities.css";
import "../pages/Profile.css";
import { post } from "../../utilities.js";
import {
  DEFAULT_PROFILE_PICTURE_SIZE,
  DEFAULT_AUTHOR_NAME_FONT_SIZE,
  DEFAULT_CONTENT_FONT_SIZE,
} from "../../utils/treeview.utils";

const NO_REDIRECT_TO_TREEVIEW = new Set(["SingleSnippet-author", "SingleSnippet-iconBar"]);

/**
 *
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {Number} scale
 * @param {Function} goToProfile
 */
const SingleSnippetAuthorInfo = (props) => {
  const imgStyle = props.scale
    ? {
        height: `${DEFAULT_PROFILE_PICTURE_SIZE * props.scale}px`,
        width: `${DEFAULT_PROFILE_PICTURE_SIZE * props.scale}px`,
        borderRadius: `50%`,
      }
    : {};
  const authorNameStyle = props.scale
    ? {
        fontSize: `${DEFAULT_AUTHOR_NAME_FONT_SIZE * props.scale}px`,
      }
    : {};
  return (
    <div
      className="SingleSnippet-authorInfo u-flexColumn u-flex-alignCenter"
      onClick={() => {
        props.goToProfile(props.author.id);
      }}
    >
      <img
        className="SingleSnippet-profilePic else"
        src={props.author.pictureURL}
        style={imgStyle}
      />
      <div className="SingleSnippet-authorName u-bold else" style={authorNameStyle}>
        {props.author.name}
      </div>
    </div>
  );
};

const SingleSnippetContentBox = ({ content, scale }) => {
  const contentStyle = {
    fontSize: `${DEFAULT_CONTENT_FONT_SIZE * (scale ? scale : 1)}px`,
  };
  //TODO: fade styling for overflow
  return <div style={contentStyle}>{content}</div>;
};

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {String} _id of the story
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {String} viewerId
 * @param {String} content of the story
 * @param {{isFavorite: Boolean, isBookmark: Boolean}} status
 * @param {Boolean} showIconBar if true, then always shows icon bar regardless of hover status. we might want to just deduce this from
 *    isTreeView, but I'm including this as a parameter in case we want extra control.
 * @param {Boolean} showAuthor used to conditionally render author name/picture
 * @param {{scale: Number, containerStyle: Object, iconBarStyle: Object, onClick: Function}} treeStyle?
 *    specified for TreeView snippets. Contains all style, sizing data
 * @param {Function} updateLocalViewer handler function passed in to update the viewer's favs/bookmarks in whatever parent component
 * @param {Object} goTo
 */
const SingleSnippet = (props) => {
  const [isHover, setIsHover] = useState(false);
  const [isToTree, setIsToTree] = useState(false); //if true, then clicking redirects to treeview

  const style = props.treeStyle
    ? props.treeStyle.containerStyle
    : isToTree
    ? { backgroundColor: `rgba(0,0,0,0.15)`, cursor: `pointer` }
    : {};
  const iconBarStyle = props.treeStyle ? props.treeStyle.iconBarStyle : {};
  const clickHandler = props.treeStyle
    ? props.treeStyle.onClick
    : isToTree
    ? () => {
        props.goTo.treeView(props._id);
      }
    : () => null;

  const scale = props.treeStyle ? props.treeStyle.scale : null;

  return (
    <div
      className={
        props.treeStyle ? "TreeViewSnippet-container" : "SingleSnippet-container u-flexColumn"
      }
      style={style}
      onClick={clickHandler}
      onMouseOver={(e) => {
        setIsHover(true);
        //things that shouldn't redirect to treeview (i.e. profile, icons) are suffixed with "else" in className
        if (!e.target.className.endsWith("else")) setIsToTree(true);
      }}
      onMouseOut={() => {
        setIsHover(false);
        setIsToTree(false);
      }}
    >
      <div className="SingleSnippet-iconBar u-flex-end" style={iconBarStyle}>
        <Icon
          showByDefault={isHover || props.showIconBar}
          imgOn={filledHeart}
          imgOff={heart}
          isActive={props.status.isFavorite}
          scale={scale}
          toggleActive={(currState) => {
            props.updateLocalViewer("favorites", props._id, currState ? "delete" : "add");
            post("/api/snippet-attribs", {
              _id: props._id,
              state: !currState,
              attrib: "favorites",
              viewerId: props.viewerId,
            });
          }}
        />
        <Icon
          showByDefault={isHover || props.showIconBar}
          imgOn={filledBookmark}
          imgOff={bookmark}
          isActive={props.status.isBookmark}
          scale={scale}
          toggleActive={(currState) => {
            props.updateLocalViewer("bookmarks", props._id, currState ? "delete" : "add");
            post("/api/snippet-attribs", {
              _id: props._id,
              state: !currState,
              attrib: "bookmarks",
              viewerId: props.viewerId,
            });
          }}
        />
      </div>
      <div className="SingleSnippet-displayBox u-flex">
        {props.showAuthor ? (
          <SingleSnippetAuthorInfo
            author={props.author}
            scale={scale}
            goToProfile={props.goTo.profile}
          />
        ) : (
          <></>
        )}
        <SingleSnippetContentBox content={props.content} scale={scale} />
      </div>
    </div>
  );
};

export default SingleSnippet;
