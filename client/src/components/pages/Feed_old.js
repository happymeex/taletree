import React, { useState, useEffect } from "react";
import { get, post } from "../../utilities";
import SingleSnippet from "../modules/SingleSnippet";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import { Link } from "@reach/router";

const Feed = (props) => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    get("/api/snippets").then((snippets) => {
      setSnippets(snippets);
    });
  }, []);

  const NewFeedSnippet = () => {
    const addPost = (input) => {
      console.log("posting snippet as " + props.userName + " with input:");
      console.log(input);
      post("/api/new-snippet", {
        authorName: props.userName,
        authorId: props.userId,
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
    snippetList = snippets.map((snippet) => {
      return (
        <SingleSnippet
          authorName={snippet.authorName}
          authorId={snippet.authorId}
          content={snippet.content}
        />
      );
    });
  }

  return (
    <div>
      <NewFeedSnippet />
      {snippetList}
    </div>
  );
};

export default Feed;
