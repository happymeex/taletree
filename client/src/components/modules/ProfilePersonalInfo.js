import React from "react";
import "../pages/Profile.css";

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 */
const ProfilePersonalInfo = (props) => {
  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <div>Profile image TODO</div>
      <div className="Profile-name">{props.name}</div>
      <div className="Profile-bio">{props.bio}</div>
    </div>
  );
};

export default ProfilePersonalInfo;
