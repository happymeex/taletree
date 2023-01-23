import React, { useEffect, useState } from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import GenericButton from "./GenericButton";

import "./NavBar.css";

const GOOGLE_CLIENT_ID = "614278991840-38k97pg151j5p5vp8is590n9fom48eko.apps.googleusercontent.com";

const NavBarDropdown = ({ userId, logout }) => {
  const navigateToProfile = () => {
    navigate(`/profile/${userId}`, {
      state: { userId: userId },
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

const NavBarButton = ({ userId, profilePicURL, logout }) => {
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
      {dropdownOpen && <NavBarDropdown userId={userId} logout={logout} />}
    </>
  );
};

const NavBar = ({ handleLogin, handleLogout, userId, userName, profilePicURL }) => {
  console.log("ProfilePicURL: " + profilePicURL);
  return (
    <div className="NavBar-container u-flex-spaceBetween">
      <div className="NavBar-websiteName">TaleTree</div>
      <div className="NavBar-buttonWrapper">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {userId ? (
            <NavBarButton
              userId={userId}
              profilePicURL={profilePicURL}
              logout={() => {
                googleLogout();
                handleLogout();
                window.location.reload();
              }}
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
