import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import ProfilePersonalInfo from "../modules/ProfilePersonalInfo";
import ProfileContent from "../modules/ProfileContent";

import "./Profile.css";

/**
 * Profile page. NOTE: CURRENTLY MISSING NAVBAR.
 *
 * proptypes
 * @param {String} profileId the profile's id
 * @param {Object} viewer the viewer
 */
const Profile = ({ profileId, viewer }) => {
  const [data, setData] = useState(undefined);
  // const [Friends, setFriends] = useState(false);
  const [allFriends, setAllFriends] = useState([]);
  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got data 1:");
      console.log(res);
      setData(res);
      //return res;
    };
    getData();
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
            isViewer={viewer._id === profileId}
            allFriends={data.friends}
          />
          <ProfileContent
            contribs={data.contribs}
            favorites={data.favorites}
            bookmarks={data.bookmarks}
            isViewer={viewer._id === profileId}
            viewer={viewer}
          />
        </div>
      )}
    </>
  );
};

export default Profile;
