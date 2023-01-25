import React, { useEffect, useState } from "react";
import "../pages/Profile.css";

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 */
const ProfilePersonalInfo = (props) => {
  const [d, setD] = useState(undefined);
  setD(props.allfriends[0])
  console.log("yooooooo")
  console.log(props.allfriends)
  //console.log(props.allfriends[0])
  console.log(d["name"])

  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={props.profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{props.name}</div>
      <div className="Profile-bio ProfileLeft-separator">{props.bio}</div>
      <div className="Profile-friendsHeader ProfileLeft-separator"> Friends </div>
      {/* <div className="Profile-friends">{props.allfriends[0].name}</div> */}
    </div>
  );
};

export default ProfilePersonalInfo;
