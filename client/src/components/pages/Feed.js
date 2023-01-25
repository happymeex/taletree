import React, { useState, useEffect } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import SingleSnippet from "../modules/SingleSnippet";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";

const ROOT = "63d04ff67f9ad37d137f7750";

const Feed = ({ userId, userName, userBookmarks, userFavorites }) => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    get("/api/snippets", { userId: userId }).then((snippets) => {
      setSnippets(snippets);
    });
  }, []);

  const NewFeedSnippet = () => {
    const addPost = (input) => {
      console.log("posting snippet as " + userName + " with input:");
      console.log(input);
      const writeToDB = async () => {
        const treeId = await post("/api/new-tree");
        console.log("browser got treeId: " + treeId);
        if (treeId)
          post("/api/new-snippet", {
            authorName: userName,
            authorId: userId,
            input: input,
            parentId: ROOT,
            treeId: treeId,
          });
      };
      writeToDB();
    };
    //returned snippet object
    return <WriteNewSnippet onPost={addPost} onClose={() => {}} />;
  };

  let snippetList = null;
  if (snippets.length === 0) {
    snippetList = <div> No snippets, log in and write one! </div>;
  } else {
    snippetList = snippets.map((snippet) => (
      <SingleSnippet
        authorName={snippet.authorName}
        authorId={snippet.authorId}
        content={snippet.content}
        _id={snippet._id}
        isTreeView={false}
        showAuthor={true}
        isFavorite={userFavorites.has(snippet._id)}
        isBookmarked={userBookmarks.has(snippet._id)}
        showIconBar={true}
      />
    ));
  }

  return (
    <div className="Feed-container">
      <NewFeedSnippet />
      <div className="Feed-snippets">{snippetList}</div>
    </div>
  );
};

export default Feed;
