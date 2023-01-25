import React, { useEffect, useState } from "react";
import "../pages/Profile.css";

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 */
const ProfilePersonalInfo = ({profilePicURL, name, bio, isViewer, allfriends}) => {
  console.log(allfriends);
  console.log(typeof(allfriends));
  console.log(allfriends[0]);
  console.log(typeof(allfriends[0]));
  let p1 = allfriends[0];
  console.log('p1 =')
  console.log(p1);
  console.log(p1[1]);
 // for (p in p1){
 //   console.log(p);
 // }

  

  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{name}</div>
      <div className="Profile-bio ProfileLeft-separator">{bio}</div>
      <div className="Profile-friendsHeader ProfileLeft-separator"> Friends </div>
      <div className="Profile-friends">{allfriends[0]}</div>
    </div>
  );
};

export default ProfilePersonalInfo;
