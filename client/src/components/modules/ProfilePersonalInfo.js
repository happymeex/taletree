import React, { useEffect, useState } from "react";
import "../pages/Profile.css";
import { get } from "../../utilities";
import ProfileCards from "./ProfileCard";
import { navigate } from "@reach/router";
import ModalBackground from "../modules/ModalBackground";

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
      style={size ? { width: size, height: size } : {}}
    ></img>
  );
};

const ProfileCard = ({ imgURL, userName, onClick }) => {
  return (
    <div className="ProfileCard-container u-flex-alignCenter">
      <SmallProfilePic imgURL={imgURL} onClick={onClick} size={`var(--xxl)`} />
      <div className="ProfileCard-friendName" onClick={onClick}>
        {userName}
      </div>
    </div>
  );
};

/**
 * Generic popup viewer
 *
 * @param {JSX} children JSX elements to be rendered
 */
const PopupViewer = (props) => {
  return <div className="PopupViewer-container u-flexColumn">{props.children}</div>;
};

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} userId id of the viewer
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 * @param {[String]} allFriends array of friends' ids
 * @param {Function} goTo
 *
 */
const ProfilePersonalInfo = (props) => {
  const [friendsData, setFriendsData] = useState([]);
  const [friendsViewer, setPopupViewer] = useState(false);
  console.log(props.allFriends);

  useEffect(() => {
    setFriendsData([]);
    setPopupViewer(false);
    const getFriends = async () => {
      const res = await get("/api/users", { ids: props.allFriends });
      console.log("got friends: ");
      console.log(res);
      setFriendsData(res);
    };
    getFriends();
  }, [props]);

  const togglePopupViewer = () => {
    setPopupViewer((s) => !s);
  };

  const picList = friendsData.map((friend, i) => {
    return (
      <SmallProfilePic
        key={i}
        imgURL={friend.pictureURL}
        onClick={() => {
          props.goTo.profile(friend._id);
        }}
      />
    );
  });

  const cardList = friendsData.map((friend, i) => {
    return (
      <ProfileCard
        key={i}
        imgURL={friend.pictureURL}
        userName={friend.name}
        onClick={() => {
          props.goTo.profile(friend._id);
        }}
      />
    );
  });

  return (
    <>
      <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
        <img src={props.profilePicURL} className="Profile-picture" />
        <div className="Profile-name ProfileLeft-separator">{props.name}</div>
        <div className="Profile-bio ProfileLeft-separator">{props.bio}</div>
        <div className="Profile-friendsDisplayBox u-flexColumn">
          <div
            className="Profile-friendsHeader ProfileLeft-separator u-flex u-bold"
            onClick={togglePopupViewer}
          >
            Friends ({props.allFriends.length})
          </div>
          <div className="Profile-smallProfileDisplayBox u-flex">{picList}</div>
        </div>
      </div>

      {friendsViewer && (
        <ModalBackground
          onClose={togglePopupViewer}
          children={
            <PopupViewer>
              {" "}
              <div className="FriendsViewer-header u-flex-justifyCenter u-flex-alignCenter">
                Friends
              </div>
              {cardList}
            </PopupViewer>
          }
        />
      )}
    </>
  );
};

export default ProfilePersonalInfo;
