import React, { useState } from "react";
import { Link } from "@reach/router";
import "./SingleSnippet.css";
import Icon from "./Icons.js";
import menuUp from "../../public/menu_up.svg";
import menuDown from "../../public/menu_down.svg";
import "../../utilities.css";
import "../pages/Profile.css";

/**
 * Story is a component that renders creator and content of a story
 *
 * Proptypes
 * @param {string} _id of the story
 * @param {string} authorName
 * @param {string} authorId
 * @param {string} content of the story
 */
const SingleSnippet = (props) => {
  return (
    <Link to={`../treeview/${props._id}`} className="SingleSnippet-StoryContent">
      <div className="SingleSnippet-container">
        <div className="SingleSnippet-icons">
          <Icon imageOn={menuUp} imageOff={menuDown} activeFunc={() => {}} />
          <Icon imageOn={menuUp} imageOff={menuDown} activeFunc={() => {}} />
          <Icon imageOn={menuUp} imageOff={menuUp} activeFunc={() => {}} />
        </div>

        <div>
          <div>
            <img className="Profile-picture" src={menuUp} />
            <Link to={`/profile/${props.authorId}`} className="u-bold">
              <div className="u-bold">{props.authorName}</div>
            </Link>
          </div>
          <body>{props.content}</body>
        </div>

        <div className="SingleSnippet-icons">
          <Icon imageOn={menuUp} imageOff={menuUp} activeFunc={() => {}} />
        </div>
      </div>
    </Link>
  );
};

export default SingleSnippet;
