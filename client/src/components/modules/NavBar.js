import React, { useEffect, useState } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import GenericButton from "./GenericButton";

import "./NavBar.css";

const GOOGLE_CLIENT_ID = "614278991840-38k97pg151j5p5vp8is590n9fom48eko.apps.googleusercontent.com";

const NavBarDropdown = ({ logout, viewer, goTo, toggleSettings }) => {
  const openSettings = () => {
    console.log("TODO: Settings popup");
  };
  return (
    <div className="NavBar-dropdownContainer">
      <GenericButton
        text="Profile"
        onClick={() => {
          goTo.profile(viewer._id);
        }}
      />
      <GenericButton text="Settings" onClick={toggleSettings} />
      <GenericButton text="Log out" onClick={logout} />
    </div>
  );
};

const NavBarButton = ({ profilePicURL, logout, viewer, goTo, toggleSettings }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    window.addEventListener("click", (e) => {
      if (
        !e.target.className.startsWith("NavBar-") ||
        e.target.className.startsWith("NavBar-container")
      )
        setDropdownOpen(false);
    });
  }, []);
  return (
    <>
      <img
        className="NavBar-profilePic"
        src={profilePicURL}
        onClick={() => setDropdownOpen((s) => !s)}
      ></img>
      {dropdownOpen && (
        <NavBarDropdown
          logout={logout}
          viewer={viewer}
          goTo={goTo}
          toggleSettings={toggleSettings}
        />
      )}
    </>
  );
};

const NavBar = ({ handleLogin, handleLogout, viewer, goTo, toggleSettings }) => {
  return (
    <div className="NavBar-container u-flex-spaceBetween u-flex-alignCenter">
      <div
        className="NavBar-websiteName"
        onClick={() => {
          goTo.home();
        }}
      >
        TaleTree
      </div>
      <div className="NavBar-buttonWrapper u-flex-alignEnd">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {viewer._id ? (
            <NavBarButton
              profilePicURL={viewer.pictureURL}
              logout={() => {
                googleLogout();
                handleLogout();
                window.location.reload();
              }}
              viewer={viewer}
              goTo={goTo}
              toggleSettings={toggleSettings}
            />
          ) : (
            <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
          )}
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default NavBar;
