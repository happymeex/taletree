import React, { useEffect, useState } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import GenericButton from "./GenericButton";

import "./NavBar.css";

const GOOGLE_CLIENT_ID = "614278991840-38k97pg151j5p5vp8is590n9fom48eko.apps.googleusercontent.com";

const NavBarDropdown = ({ logout, viewer }) => {
  const navigateToProfile = () => {
    navigate(`/profile/${viewer._id}`, {
      state: { viewer: viewer },
    });
  };
  const openSettings = () => {
    console.log("TODO: Settings popup");
  };
  return (
    <div className="NavBar-dropdownContainer">
      <GenericButton text="Profile" onClick={navigateToProfile} />
      <GenericButton text="Settings" onClick={openSettings} />
      <GenericButton text="Log out" onClick={logout} />
    </div>
  );
};

const NavBarButton = ({ profilePicURL, logout, viewer }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    window.addEventListener("click", (e) => {
      if (!e.target.className.startsWith("NavBar-")) setDropdownOpen(false);
    });
  }, []);
  return (
    <>
      <img
        className="NavBar-profilePic"
        src={profilePicURL}
        onClick={() => setDropdownOpen((s) => !s)}
      ></img>
      {dropdownOpen && <NavBarDropdown logout={logout} viewer={viewer} />}
    </>
  );
};

const NavBar = ({ handleLogin, handleLogout, viewer }) => {
  return (
    <div className="NavBar-container u-flex-spaceBetween">
      <div
        className="NavBar-websiteName"
        onClick={() => {
          navigate("/", {
            state: {
              handleLogin: handleLogin,
              handleLogout: handleLogout,
              userName: viewer.name,
              viewer: viewer,
            },
          });
        }}
      >
        TaleTree
      </div>
      <div className="NavBar-buttonWrapper">
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
