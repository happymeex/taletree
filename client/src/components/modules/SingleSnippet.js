import React from "react";
import { Link } from "@reach/router";
import "./Card.css";
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
    <div className="Card-story">
      {/*<Link to={`/profile/${props.authorId}`} className="u-link u-bold">*/}
      <div className="u-bold">{props.authorName}</div>
      {/*</Link>*/}
      <Link to={`../treeview/${props._id}`} className="Card-StoryContent">
        {props.content}
      </Link>
    </div>
  );
};

export default SingleSnippet;
