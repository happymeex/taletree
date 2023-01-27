import React, { useState, useEffect } from "react";
import { Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import TreeView from "./pages/TreeView";
import Feed from "./pages/Feed.js";
import Profile from "./pages/Profile.js";
import NavBar from "./modules/NavBar";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import { navigate } from "@reach/router";

/**
 * Define the "App" component
 */
const App = () => {
  const [gotUser, setGotUser] = useState(false); //want to wait until we have user data (or lack thereof) before we render router
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [profilePicURL, setProfilePicURL] = useState(undefined);
  const [viewer, setViewer] = useState({
    _id: undefined,
    bookmarks: new Set(),
    favorites: new Set(),
    setter: undefined,
  });

  useEffect(() => {
    get("/api/whoami")
      .then(async (user) => {
        if (user._id) {
          // they are registed in the database, and currently logged in.
          setUserId(user._id);
          await get("/api/profile", { id: user._id }).then((user) => {
            setViewer({
              _id: user._id,
              bookmarks: new Set(user.bookmarks),
              favorites: new Set(user.favorites),
              setter: setViewer,
            });
          });
          setUserName(user.name);
          setProfilePicURL(user.pictureURL);
        }
      })
      .then(() => {
        setGotUser(true);
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
      setUserId(user._id);
      setUserName(name);
      setProfilePicURL(user.pictureURL);
      post("/api/initsocket", { socketid: socket.id });
      window.location.reload();
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    post("/api/logout");
  };

  const goToProfile = (id) => {
    navigate(`/profile/${id}`, {
      state: { viewer: viewer },
    });
  };

  const goToTreeView = (id) => {
    navigate(`/treeview/${id}`, {
      state: { viewer: viewer, userName: userName },
    });
  };

  const goTo = {
    profile: goToProfile,
    treeView: goToTreeView,
  };

  return (
    <>
      <NavBar
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        userName={userName}
        profilePicURL={profilePicURL}
        viewer={viewer}
      />
      {gotUser ? (
        <Router>
          <Feed
            path="/"
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            userName={userName}
            viewer={viewer}
            goTo={goTo}
          />
          <TreeView path="/treeview/:snippetId" userName={userName} viewer={viewer} goTo={goTo} />
          <Profile path="/profile/:profileId" viewer={viewer} goTo={goTo} />
          <NotFound default />
        </Router>
      ) : (
        <div className="Loading">Loading...</div>
      )}
    </>
  );
};

export default App;
