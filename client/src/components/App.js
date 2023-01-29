import React, { useState, useEffect, useMemo } from "react";
import { isRedirect, Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import TreeView from "./pages/TreeView";
import Feed from "./pages/Feed.js";
import Profile from "./pages/Profile.js";
import NavBar from "./modules/NavBar";
import ModalBackground from "./modules/ModalBackground.js";
import ThreadReader from "./modules/ThreadReader.js";
import WriteNewSnippet from "./modules/WriteNewSnippet.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import { navigate } from "@reach/router";

const ANONYMOUS_VIEWER = {
  _id: null,
  name: null,
  pictureURL: null,
  bookmarks: new Set(),
  favorites: new Set(),
};

/**
 * Define the "App" component
 */
const App = () => {
  const [viewer, setViewer] = useState(undefined);
  const [reader, setReader] = useState(false);
  const [writer, setWriter] = useState(false);
  const [readerContent, setReaderContent] = useState(undefined);
  const [postHandler, setPostHandler] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then(async (user) => {
      if (user._id) {
        console.log("got user!");
        // they are registed in the database, and currently logged in.
        //setUserId(user._id);
        await get("/api/profile", { id: user._id }).then((user) => {
          setViewer({
            _id: user._id,
            name: user.name,
            pictureURL: user.pictureURL,
            bookmarks: new Set(user.bookmarks),
            favorites: new Set(user.favorites),
          });
        });
      } else setViewer(ANONYMOUS_VIEWER);
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log("decodedCredential");
    console.log(decodedCredential);
    const name = `${decodedCredential.name}`;
    console.log(`Logged in as ${decodedCredential.name}`);

    post("/api/login", { token: userToken }).then((user) => {
      //setUserId(user._id);
      //setUserName(name);
      //setProfilePicURL(user.pictureURL);
      window.location.reload();
      setViewer({
        _id: user._id,
        name: user.name,
        pictureURL: user.pictureURL,
        bookmarks: new Set(user.bookmarks),
        favorites: new Set(user.favorites),
      });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    window.location.reload();
    post("/api/logout");
  };

  const goToProfile = (id) => {
    navigate(`/profile/${id}`);
    window.location.reload();
  };

  const goToTreeView = (id) => {
    navigate(`/treeview/${id}`);
  };

  const goTo = {
    profile: goToProfile,
    treeView: goToTreeView,
  };

  //passed down as a prop to the various pages, which will call the handlers to set
  //the appropriate states to open the needed popup
  const popupHandlers = {
    toggle: (popup) => {
      if (popup === "reader") {
        if (reader) setReaderContent(undefined);
        setReader((s) => !s);
      } else if (popup === "writer") {
        if (writer) setPostHandler(undefined);
        setWriter((s) => !s);
      }
    },
    setContent: (text) => {
      setReaderContent(text);
    },
    setWriteHandler: (func) => {
      setPostHandler(() => func);
    },
  };

  return (
    <>
      {useMemo(() => {
        return viewer ? (
          <>
            <NavBar handleLogin={handleLogin} handleLogout={handleLogout} viewer={viewer} />
            <Router>
              <Feed
                path="/"
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                viewer={viewer}
                goTo={goTo}
                popupHandlers={popupHandlers}
              />
              <TreeView
                path="/treeview/:snippetId"
                viewer={viewer}
                goTo={goTo}
                popupHandlers={popupHandlers}
              />
              <Profile
                path="/profile/:profileId"
                viewer={viewer}
                goTo={goTo}
                popupHandlers={popupHandlers}
              />
              <NotFound default />
            </Router>
          </>
        ) : (
          <div className="Loading">Loading...</div>
        );
      }, [viewer])}
      {(reader || writer) && (
        <ModalBackground
          onClose={() => {
            setReader(false);
            setWriter(false);
            setReaderContent(undefined);
            setPostHandler(undefined);
          }}
        >
          {reader && readerContent && <ThreadReader content={readerContent} />}
          {writer && postHandler && (
            <WriteNewSnippet
              onClose={() => {
                setWriter(false);
                setPostHandler(undefined);
              }}
              onPost={postHandler}
            />
          )}
        </ModalBackground>
      )}
    </>
  );
};

export default App;
