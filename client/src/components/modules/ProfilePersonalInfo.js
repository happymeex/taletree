import React, { useEffect, useState } from "react";
import "../pages/Profile.css";
import { get } from "../../utilities";
import ProfileCards from "./ProfileCard";
import { navigate } from "@reach/router";

/**
 * Small profile picture that appears in a profile's friendslist
 *
 * @param {String} imgURL
 * @param {Function} onClick handler function to navigate to the corresponding profile
 * @param {String} size? optional parameter to control size
 */
const SmallProfilePic = ({ imgURL, onClick, size }) => {
  console.log("rendering small");
  console.log("friend URL: " + imgURL);
  return (
    <img
      className="Profile-smallProfilePic"
      src={imgURL}
      onClick={onClick}
      style={size ? { width: `${size}` } : {}}
    ></img>
  );
};

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 */
const ProfilePersonalInfo = ({ profilePicURL, userId, name, bio, isViewer, allFriends }) => {
  const [fdata, fsetData] = useState([]);
  console.log(allFriends);

  useEffect(() => {
    const getFriends = async () => {
      const res = await get("/api/users", { ids: allFriends });
      console.log("got friends: ");
      console.log(res);
      fsetData(res);
    };
    getFriends();
  }, allFriends);

  const friendList = fdata.map((friend, i) => {
    return (
      <SmallProfilePic
        key={i}
        imgURL={friend.pictureURL}
        onClick={() => {
          navigate(`/profile/${friend._id}`, {
            state: {
              userId: userId,
              userBookmarks: new Set(), //todo: sebastian's stuff
              userFavorites: new Set(),
            },
          });
        }}
      />
    );
  });

  return (
    <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{name}</div>
      <div className="Profile-bio ProfileLeft-separator">{bio}</div>
      <div className="Profile-friendsDisplayBox u-flexColumn">
        <div className="Profile-friendsHeader ProfileLeft-separator u-flex u-bold">
          Friends ({allFriends.length})
        </div>
        <div className="Profile-smallProfileDisplayBox u-flex">{friendList}</div>
      </div>
    </div>
  );
};

export default ProfilePersonalInfo;
