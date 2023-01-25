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
 * @param {[String]} userBookmarks the viewer's bookmarks
 * @param {[String]} userFavorites the viewer's favorites
 */
const Profile = ({ userId, profileId, userBookmarks, userFavorites }) => {
  const [data, setData] = useState(undefined);
  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got data:");
      console.log(res);
      setData(res);
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
            isViewer={userId === profileId}
          />
          <ProfileContent
            contribs={data.contribs}
            favorites={data.favorites}
            bookmarks={data.bookmarks}
            isViewer={userId === profileId}
            userFavorites={userFavorites}
            userBookmarks={userBookmarks}
          />
        </div>
      )}
    </>
  );
};

export default Profile;
