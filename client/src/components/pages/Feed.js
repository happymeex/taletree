import React, { useState, useEffect } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import SingleSnippet from "../modules/SingleSnippet";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";
import leaf from "../../public/leaf.svg";

const ROOT = "63d04ff67f9ad37d137f7750";

const WriteNewSnippetButton = ({ onClick }) => {
  return (
    <div
      className="FeedWriteNewSnippetButton-container u-flex-justifyCenter u-flex-alignCenter"
      onClick={onClick}
    >
      <img className="FeedWriteNewSnippetButton-icon" src={leaf}></img>
    </div>
  );
};

const Feed = ({ userId, userName, handleLogin, handleLogout }) => {
  const [snippets, setSnippets] = useState([]);
  const [writer, setWriter] = useState(false); //whether new snippet popup is open

  useEffect(() => {
    get("/api/snippets", { userId: userId }).then((snippets) => {
      setSnippets(snippets);
    });
  }, []);

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
        isLiked={false}
        isBookmarked={false}
        showIconBar={true}
      />
    ));
  }

  const toggleSnippetWriter = () => {
    setWriter((s) => !s);
  };

  return (
    <div className="Feed-container">
      {writer && (
        <ModalBackground
          onClose={() => {
            setWriter(false);
          }}
          children={<WriteNewSnippet onPost={addPost} onClose={toggleSnippetWriter} />}
        />
      )}
      <div className="Feed-snippets">{snippetList}</div>
      {userId && <WriteNewSnippetButton onClick={toggleSnippetWriter} />}
    </div>
  );
};

export default Feed;
