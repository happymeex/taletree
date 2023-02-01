import React, { useState, useEffect, useMemo } from "react";
import { Router } from "@reach/router";
import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import TreeView from "./pages/TreeView";
import Feed from "./pages/Feed.js";
import Profile from "./pages/Profile.js";
import NavBar from "./modules/NavBar";
import ModalBackground from "./modules/ModalBackground.js";
import ThreadReader from "./modules/ThreadReader.js";
import WriteNewSnippet from "./modules/WriteNewSnippet.js";
import SettingsPopup from "./modules/SettingsPopup.js";
import Landing from "./pages/Landing.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";
import {
  DEFAULT_SETTINGS,
  ANONYMOUS_USER,
  populateSettings,
  initializeUser,
} from "../utils/user.utils.js";
import { navigate } from "@reach/router";

const goToFactory = (loc, setRerenderTrigger) => {
  return (id) => {
    console.log("Going to " + loc);
    const url = id ? `/${loc}/${id}` : `/${loc}`;
    navigate(url);
    setRerenderTrigger((s) => !s);
  };
};
/**
 * Define the "App" component
 */
const App = () => {
  const [viewer, setViewer] = useState(undefined);
  const [reader, setReader] = useState(false);
  const [writer, setWriter] = useState(false);
  const [landing, setLanding] = useState(true);
  const [writerPlaceholder, setWriterPlaceholder] = useState(undefined);
  const [settings, setSettings] = useState(false);
  const [readerContent, setReaderContent] = useState(undefined);
  const [postHandler, setPostHandler] = useState(undefined);
  const [rerenderTrigger, setRerenderTrigger] = useState(false);

  useEffect(() => {
    get("/api/whoami").then(async (user) => {
      if (user._id) {
        console.log("got user!");
        // they are registed in the database, and currently logged in.
        get("/api/profile", { id: user._id }).then((user) => {
          console.log("user: ");
          console.log(user);
          setLanding(false);
          initializeUser(setViewer, user);
        });
      } else initializeUser(setViewer, ANONYMOUS_USER);
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
      window.location.reload();
      initializeUser(setViewer, user);
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    post("/api/logout")
      .then(() => {
        console.log("ok");
        window.location.reload();
      })
      .catch((err) => {
        alert("An error occurred while logging out!");
      });
  };

  const goTo = {
    home: goToFactory("", setRerenderTrigger),
    profile: goToFactory("profile", setRerenderTrigger),
    treeView: goToFactory("treeview", setRerenderTrigger),
    notFound: goToFactory("not-found", (f) => f(0)),
  };

  //passed down as a prop to the various pages, which will call the handlers to set
  //the appropriate states to open the needed popup
  //params
  const popupHandlers = {
    toggle: (popup) => {
      if (popup === "reader") {
        setReader((s) => !s);
      } else if (popup === "writer") {
        setWriter((s) => !s);
      }
    },
    setContent: (text) => {
      setReaderContent(text);
    },
    setWriteHandler: (func) => {
      setPostHandler(() => func);
    },
    setWriterPlaceholder: setWriterPlaceholder,
  };

  const toggleSettings = () => {
    setSettings((s) => !s);
  };

  console.log("App rerendering");
  return (
    <>
      {useMemo(() => {
        return viewer ? (
          !landing ? (
            <>
              <NavBar
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                viewer={viewer}
                goTo={goTo}
                toggleSettings={toggleSettings}
              />
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
            <Landing handleLogin={handleLogin} setLanding={setLanding} />
          )
        ) : (
          <div className="Loading"></div>
        );
      }, [viewer, landing, rerenderTrigger])}
      {(reader || writer || settings) && (
        <ModalBackground
          onClose={() => {
            setReader(false);
            setWriter(false);
            setSettings(false);
            setReaderContent(undefined);
            setPostHandler(undefined);
          }}
        >
          {(reader || writer) && (
            <div className="ModalBackground-readerWriterWrapper">
              {reader && readerContent && (
                <ThreadReader goTo={goTo} content={readerContent} popupHandlers={popupHandlers} />
              )}
              {writer && postHandler && writerPlaceholder && (
                <WriteNewSnippet
                  onClose={() => {
                    setWriter(false);
                    setReader(false);
                    setPostHandler(undefined);
                  }}
                  onPost={postHandler}
                  flavortext={writerPlaceholder}
                />
              )}
            </div>
          )}
          {settings && <SettingsPopup setViewer={setViewer} settings={viewer.settings} />}
        </ModalBackground>
      )}
    </>
  );
};

export default App;
