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
  // const 
  if (props.friends && props.friends.length) {

    // console.log("yuuu")
    useEffect(() => {
      console.log("viewing profile of user " + profileId);
      const getData = async () => {
        const res = await get("/api/profile", { id: profileId });
        console.log("got data:");
        console.log(res);
        setData(res);
        // setFriends('friends' in res)
        // console.log('friends' in res)
      };
      getData();
      console.log("This is data:" + data);
    }, []);

  }
  
  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={props.profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{props.name}</div>
      <div className="Profile-bio ProfileLeft-separator">{props.bio}</div>
      <div className="Profile-friendsHeader ProfileLeft-separator"> Friends </div>
      <div className="Profile-friends">{props.friends}</div>
    </div>
  );
};

export default ProfilePersonalInfo;
