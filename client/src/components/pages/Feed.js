import React, { useState, useEffect } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import SingleSnippet from "../modules/SingleSnippet";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";

const Feed = ({ userId, userName, handleLogin, handleLogout }) => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    get("/api/snippets").then((snippets) => {
      setSnippets(snippets);
    });
  }, []);

  const NewFeedSnippet = () => {
    const addPost = (input) => {
      console.log("posting snippet as " + userName + " with input:");
      console.log(input);
      post("/api/new-snippet", {
        authorName: userName,
        authorId: userId,
        input: input,
      });
    };
    //returned snippet object
    return <WriteNewSnippet onPost={addPost} onClose={() => {}} />;
  };

  let snippetList = null;
  if (snippets.length === 0) {
    snippetList = <div> No snippets! </div>;
  } else {
    snippetList = snippets.map((snippet) => (
      <SingleSnippet
        authorName={snippet.authorName}
        authorId={snippet.authorId}
        content={snippet.content}
        _id={snippet._id}
      />
    ));
  }

  return (
    <div>
      <NewFeedSnippet />
      <div>{snippetList}</div>
      <button
        onClick={() => {
          navigate(`/treeview/63c870ed53ecea1d0cbdc569`, {
            state: { userId: userId, userName: userName },
          });
        }}
      >
        Go to TreeView
      </button>
    </div>
  );
};

export default Feed;
