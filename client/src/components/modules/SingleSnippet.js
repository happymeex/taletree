import React, { useEffect, useState } from "react";
import Highlight from "react-highlighter";
import "./SingleSnippet.css";
import "./TreeViewSnippet.css";
import Icon from "./Icons.js";
import heart from "../../public/heart.svg";
import bookmark from "../../public/bookmark.svg";
import sprout from "../../public/sprout.svg";
import filledBookmark from "../../public/bookmark_filled.svg";
import filledHeart from "../../public/heart_filled.svg";
import "../../utilities.css";
import "../pages/Profile.css";
import { post } from "../../utilities.js";

const SEARCH_HIGHLIGHT_STYLE = {
  fontWeight: `bold`,
  backgroundColor: `var(--primary--dim)`,
};

/**
 *
 * @param {{name: String, id: String, pictureURL: String}} author
 * @param {Function} goToProfile
 */
const SingleSnippetAuthorInfo = ({ author, goToProfile, search }) => {
  return (
    <div className="SingleSnippet-authorInfo u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img
        className="SingleSnippet-profilePic else"
        src={author.pictureURL}
        onClick={() => {
          goToProfile(author.id);
        }}
      />
      <div
        className="SingleSnippet-authorName u-bold u-clickableText else"
        onClick={() => {
          goToProfile(author.id);
        }}
      >
        {search ? (
          <Highlight search={search[0]} matchStyle={SEARCH_HIGHLIGHT_STYLE}>
            {author.name}
          </Highlight>
        ) : (
          author.name
        )}
      </div>
    </div>
  );
};

const SingleSnippetContentBox = ({ content, search }) => {
  return (
    <div className="SingleSnippet-contentBox u-flexColumn">
      <div className="SingleSnippet-contentWrapper">
        {search ? (
          <Highlight search={search[0]} matchStyle={SEARCH_HIGHLIGHT_STYLE}>
            {content}
          </Highlight>
        ) : (
          content
        )}
      </div>
    </div>
  );
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
 * @param {{authorDisplay: Boolean, showSnippetLikes: Boolean}} settings
 * @param {[String]} search? an array of keywords to highlight. for now, this will always have length 1, unless we decide on more fancy
 * @param {{scale: Number, containerStyle: Object, onClick: Function}} treeStyle?
 *    specified for TreeView snippets. Contains all style, sizing data
 * @param {Function} updateLocalViewer handler function passed in to update the viewer's favs/bookmarks in whatever parent component
 * @param {Object} goTo
 * @param {Number} numLikes number of likes
 * @param {{toggle: Function, setContentGenerator: Function}} popupHandlers
 */
const SingleSnippet = (props) => {
  const [likes, setLikes] = useState(props.numLikes);
  const [isHover, setIsHover] = useState(false);
  const [isToTree, setIsToTree] = useState(false); //if true, then clicking redirects to treeview

  const style = props.treeStyle
    ? props.treeStyle.containerStyle
    : isToTree
    ? { backgroundColor: `rgba(0,0,0,0.05)`, cursor: `pointer` }
    : {};
  const clickHandler = props.treeStyle
    ? props.treeStyle.onClick
    : isToTree
    ? () => {
        props.popupHandlers.setContent([props.content]);
        props.popupHandlers.toggle("reader");
      }
    : () => null;

  const className =
    (props.treeStyle
      ? (props.treeStyle.highlight ? "TreeViewSnippet-highlight " : "") +
        "TreeViewSnippet-container"
      : "SingleSnippet-container") + " u-flex";

  return (
    <>
      <div
        className={className}
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
        {props.settings.authorVisible ? (
          <SingleSnippetAuthorInfo
            author={props.author}
            goToProfile={props.goTo.profile}
            search={props.search}
          />
        ) : (
          <></>
        )}
        <div className="SingleSnippet-displayBox u-flexColumn">
          <div className="SingleSnippet-iconBar u-flex-end">
            {!props.treeStyle && (
              <Icon
                showByDefault={isHover || props.showIconBar}
                imgOn={sprout}
                imgOff={sprout}
                desc={"Sprout"}
                isActive={false}
                toggleActive={(c) => {
                  props.goTo.treeView(props._id);
                }}
              />
            )}
            {props.viewerId && (
              <div>
                <Icon
                  showByDefault={isHover || props.showIconBar}
                  imgOn={filledHeart}
                  imgOff={heart}
                  desc={"Heart"}
                  isActive={props.status.isFavorite}
                  toggleActive={(currState) => {
                    props.updateLocalViewer("favorites", props._id, currState ? "delete" : "add");
                    setLikes(currState ? likes - 1 : likes + 1);
                    post("/api/snippet-attribs", {
                      _id: props._id,
                      state: !currState,
                      attrib: "favorites",
                      viewerId: props.viewerId,
                    });
                  }}
                />
                {props.settings.showSnippetLikes && (
                  <div className="SingleSnippet-likes">{likes}</div>
                )}
              </div>
            )}
            {props.viewerId && (
              <Icon
                showByDefault={isHover || props.showIconBar}
                imgOn={filledBookmark}
                imgOff={bookmark}
                desc={"Bookmark"}
                isActive={props.status.isBookmark}
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
            )}
          </div>
          <SingleSnippetContentBox content={props.content} search={props.search} />
        </div>
      </div>
    </>
  );
};

export default SingleSnippet;
