import React, { useState, useEffect } from "react";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import "../../utilities.css";
import "./Feed.css";
import { get, post } from "../../utilities";
import leaf from "../../public/leaf.svg";
import "./Profile.css";
import SnippetDisplay from "../modules/SnippetDisplay";

const ROOT = "63d04ff67f9ad37d137f7750";
const MAX_SNIPPETS_PER_PAGE = 6;

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

const Feed = ({ userName, viewer, goTo }) => {
  const [snippets, setSnippets] = useState(undefined);
  const [writer, setWriter] = useState(false); //whether new snippet popup is open

  useEffect(() => {
    get("/api/snippets", { userId: viewer._id }).then((snippets) => {
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
          authorId: viewer._id,
          input: input,
          parentId: ROOT,
          treeId: treeId,
        });
    };
    writeToDB();
  };

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
      <div className="Feed-snippets">
        {snippets ? (
          <SnippetDisplay
            viewer={viewer}
            goTo={goTo}
            snippets={snippets}
            maxPerPage={MAX_SNIPPETS_PER_PAGE}
          />
        ) : (
          <div className="Loading">Loading...</div>
        )}
      </div>
      {viewer._id && <WriteNewSnippetButton onClick={toggleSnippetWriter} />}
    </div>
  );
};

export default Feed;
