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

/**
 * Define the "App" component
 */
const App = () => {
  const [gotUser, setGotUser] = useState(false); //want to wait until we have user data (or lack thereof) before we render router
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [profilePicURL, setProfilePicURL] = useState(undefined);
  const [userBookmarks, setBookmarks] = useState(undefined);
  const [userFavorites, setFavorites] = useState(undefined);

  useEffect(() => {
    get("/api/whoami")
      .then((user) => {
        if (user._id) {
          // they are registed in the database, and currently logged in.
          setUserId(user._id);
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
    post("/api/login", { token: userToken })
      .then((user) => {
        setUserId(user._id);
        setUserName(name);
        setProfilePicURL(user.pictureURL);
        post("/api/initsocket", { socketid: socket.id });
        window.location.reload();
      })
      .then(() =>
        get("/api/profile", { id: userId }).then((user) => {
          setBookmarks(new Set(user.bookmarks));
          setFavorites(new Set(user.favorites));
        })
      );
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    post("/api/logout");
  };

  return (
    <>
      <NavBar
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        userId={userId}
        userName={userName}
        profilePicURL={profilePicURL}
      />
      {gotUser ? (
        <Router>
          <Feed
            path="/"
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            userId={userId}
            userName={userName}
            userBookmarks={userBookmarks}
            userFavorites={userFavorites}
          />
          <TreeView
            path="/treeview/:snippetId"
            userId={userId}
            userName={userName}
            userBookmarks={userBookmarks}
            userFavorites={userFavorites}
          />
          <Profile
            path="/profile/:profileId"
            userId={userId}
            userBookmarks={userBookmarks}
            userFavorites={userFavorites}
          />
          <NotFound default />
        </Router>
      ) : (
        <div className="Loading">Loading...</div>
      )}
    </>
  );
};

export default App;
