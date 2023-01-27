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
 * @param {String} authorId
 * @param {String} authorName
 * @param {Number} scale
 * @param {Object} viewer
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
        navigate(`/profile/${props.authorId}`, {
          state: {
            viewer: props.viewer,
          },
        });
      }}
    >
      <img className="SingleSnippet-profilePic else" src={menuUp} style={imgStyle} />
      <div className="SingleSnippet-authorName u-bold else" style={authorNameStyle}>
        {props.authorName}
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
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} content of the story
 * @param {Object} viewer the viewer
 * @param {Boolean} isTreeView used to conditionally render "read" button and determine whether snippet is clickable
 * @param {Boolean} showIconBar if true, then always shows icon bar regardless of hover status. we might want to just deduce this from
 *    isTreeView, but I'm including this as a parameter in case we want extra control.
 * @param {Boolean} showAuthor used to conditionally render author name/picture
 * @param {Number} scale only used for treeview
 * @param {Object} style used only for treeview
 * @param {Object} onClick used only for treeview
 */
const SingleSnippet = (props) => {
  const [isHover, setIsHover] = useState(false);
  const [isToTree, setIsToTree] = useState(false); //if true, then clicking redirects to treeview
  const [isFavorite, setFavorite] = useState(props.viewer.favorites.has(props._id));
  const [isBookmarked, setBookmarked] = useState(props.viewer.bookmarks.has(props._id));

  const style = props.isTreeView
    ? props.style
    : isToTree
    ? { backgroundColor: `rgba(0,0,0,0.15)`, cursor: `pointer` }
    : {};
  const clickHandler = props.isTreeView
    ? props.onClick
    : isToTree
    ? () => {
        navigate(`/treeview/${props._id}`, {
          state: { viewer: props.viewer },
        });
      }
    : () => null;
  if (props.isTreeView)
    console.log("box height: " + props.style.height + " box width: " + props.style.width);
  return (
    <div
      className={
        props.isTreeView ? "TreeViewSnippet-container" : "SingleSnippet-container u-flexColumn"
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
      <div className="SingleSnippet-iconBar u-flex-end">
        <Icon
          showByDefault={isHover || props.showIconBar}
          imgOn={filledHeart}
          imgOff={heart}
          isActive={isFavorite}
          scale={props.scale}
          toggleActive={(currState) => {
            post("/api/snippet-attribs", {
              _id: props._id,
              state: !currState,
              attrib: "favorite",
              viewer: props.viewer._id,
            }).then(() => {
              setFavorite(!isFavorite);
              //console.log(currState);
              if (isFavorite) props.viewer.favorites.add(props._id);
              else props.viewer.favorites.delete(props._id);
              console.log("heart clicked");
            });
          }}
        />
        <Icon
          showByDefault={isHover || props.showIconBar}
          imgOn={filledBookmark}
          imgOff={bookmark}
          isActive={isBookmarked}
          toggleActive={(currState) => {
            post("/api/snippet-attribs", {
              _id: props._id,
              state: !currState,
              attrib: "bookmark",
              viewer: props.viewer._id,
            }).then(() => {
              setBookmarked(!isBookmarked);
              //console.log(currState);
              if (isBookmarked) props.viewer.bookmarks.add(props._id);
              else props.viewer.bookmarks.delete(props._id);
              console.log("bookmark clicked");
            });
          }}
        />
      </div>
      <div className="SingleSnippet-displayBox u-flex">
        {props.showAuthor ? (
          <SingleSnippetAuthorInfo
            authorId={props.authorId}
            authorName={props.authorName}
            scale={props.scale}
            viewer={props.viewer}
          />
        ) : (
          <></>
        )}
        <SingleSnippetContentBox content={props.content} scale={props.scale} />
      </div>
    </div>
  );
};

export default SingleSnippet;
