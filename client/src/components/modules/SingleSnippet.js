import React, { useEffect, useState } from "react";
import { Link } from "@reach/router";
import { navigate } from "@reach/router";
import "./SingleSnippet.css";
import Icon from "./Icons.js";
import menuUp from "../../public/menu_up.svg";
import heart from "../../public/heart.svg";
import filledHeart from "../../public/filled_heart.svg";
import "../../utilities.css";
import "../pages/Profile.css";

const NO_REDIRECT_TO_TREEVIEW = new Set(["SingleSnippet-author", "SingleSnippet-iconBar"]);

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {String} _id of the story
 * @param {String} authorName
 * @param {String} authorId
 * @param {String} userId viewer's id
 * @param {String} content of the story
 * @param {Boolean} isLiked used to determine "heart" button's initial render state
 * @param {Boolean} isBookmarked used to determine "bookmark" button's initial render state
 * @param {Boolean} isTreeView used to conditionally render "read" button and determine whether snippet is clickable
 * @param {Boolean} showIconBar if true, then always shows icon bar regardless of hover status. we might want to just deduce this from
 *    isTreeView, but I'm including this as a parameter in case we want extra control.
 * @param {Boolean} showAuthor used to conditionally render author name/picture
 * @param {Object} style used only for treeview
 */
const SingleSnippet = (props) => {
  const [isHover, setIsHover] = useState(false);
  const [isToTree, setIsToTree] = useState(false); //if true, then clicking redirects to treeview
  return (
    <div
      className={
        props.isTreeView ? "TreeViewSnippet-container" : "SingleSnippet-container u-flexColumn"
      }
      style={
        isToTree && !props.isTreeView
          ? { backgroundColor: `rgba(0,0,0,0.15)`, cursor: `pointer` }
          : props.isTreeView
          ? props.style
          : {}
      }
      onClick={
        isToTree
          ? () => {
              navigate(`/treeview/${props._id}`);
            }
          : () => null
      }
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
          initialActive={false}
          toggleActive={(currState) => {
            console.log("heart clicked");
          }}
        />
        <div>Bookmark</div>
      </div>
      <div className="SingleSnippet-displayBox u-flex">
        {props.showAuthor ? (
          <div
            className="SingleSnippet-authorInfo u-flexColumn u-flex-alignCenter"
            onClick={() => {
              navigate(`/profile/${props.authorId}`, { state: { userId: props.userId } });
            }}
          >
            <img className="SingleSnippet-profilePic else" src={menuUp} />
            <div className="SingleSnippet-authorName u-bold else">{props.authorName}</div>
          </div>
        ) : (
          <></>
        )}
        <div className="SingleSnippet-contentBox">{props.content}</div>
      </div>
    </div>
  );
};

export default SingleSnippet;
