import React from "react";
import "../pages/Profile.css";

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 * @param {String} profilePicURL
 */
const ProfilePersonalInfo = ({ name, bio, isViewer, profilePicURL }) => {
  console.log("got picture: " + profilePicURL);
  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={profilePicURL} className="Profile-picture" />
      <div className="Profile-name">{name}</div>
      <div className="Profile-bio">{bio}</div>
    </div>
  );
};

export default ProfilePersonalInfo;
