import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import ProfilePersonalInfo from "../modules/ProfilePersonalInfo";
import ProfileContent from "../modules/ProfileContent";

import "./Profile.css";

/**
 * Profile page. NOTE: CURRENTLY MISSING NAVBAR.
 *
 * proptypes
 * @param {String} userId the viewer's id
 * @param {String} profileId the profile's id
 */
const Profile = ({ userId, profileId }) => {
  const [data, setData] = useState(undefined);
  const [Friends, setFriends] = useState(false);
  const [allFriends, setAllFriends] = useState([]);
  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got data 1:");
      console.log(res);
      setData(res);
      return res;
      // if(Friends){
      //   const getFriendData = async () => {
      //     const res_friend = await get("/api/profile", { id: data.friends });
      //     console.log("got friend data:");
      //     console.log(res_friend);
      //     setAllFriends(res_friend);

      //   getFriendData
      //   }
      // }
    };
    getData().then( (data) => {
      console.log("hi")
      console.log(data.friends)
      console.log("hehe")
    });

    // const getFriends = async () => {
    //   const   
    // }
    // setFriends(data.friends && data.friends.length);
    // console.log(data.friends)
    
  }, [profileId]);

  return (
    <>
      {!data ? (
        <div className="Loading">Loading</div>
      ) : (
        <div className="Profile-container">
          <ProfilePersonalInfo
            name={data.name}
            bio={data.bio}
            profilePicURL={data.pictureURL}
            isViewer={userId === profileId}
            // hasFriends = {Friends}
            // allFriends = {data.friends ? Friends : []}

          />
          <ProfileContent
            contribs={data.contribs}
            favorites={data.favorites}
            bookmarks={data.bookmarks}
            isViewer={userId === profileId}
          />
        </div>
      )}
    </>
  );
};

export default Profile;
