import React, { useState, useEffect } from "react";
import { Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import TreeView from "./pages/TreeView";
import Feed from "./pages/Feed.js";
import Profile from "./pages/Profile.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserName(user.name);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    const name = `${decodedCredential.name}`;
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      setUserName(name);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUserName(undefined);
    post("/api/logout");
  };

  return (
    <>
      <Router>
        <Feed
          path="/"
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          userId={userId}
          userName={userName}
        />
        <TreeView path="/treeview/:snippetId" userId={userId} userName={userName} />
        <Profile path="/profile/:profileId" userId={userId} />
        <NotFound default />
      </Router>
    </>
  );
};

export default App;
