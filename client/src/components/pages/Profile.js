import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import ProfilePersonalInfo from "../modules/ProfilePersonalInfo";
import SnippetDisplay from "../modules/SnippetDisplay";

import "./Profile.css";

const MAX_SNIPPETS_PER_PAGE = 10;

/**
 * Profile page.
 *
 * proptypes
 * @param {String} profileId the profile's id
 * @param {Object} viewer the viewer
 * @param {Object} goTo navigation functions
 * @param {Object} popupHandlers
 */
const Profile = ({ profileId, viewer, goTo, popupHandlers }) => {
  const [data, setData] = useState(undefined);
  const [snippetData, setSnippetData] = useState(undefined);
  const [authorToPic, setAuthorToPic] = useState(undefined);

  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getProfileData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got profile data:");
      console.log(res);
      setData(res);
      return res;
    };
    const getProfileSnippetData = async (profileData) => {
      let params = {
        Contributions: profileData.contribs,
        Favorites: profileData.favorites,
      };
      if (profileId === viewer._id) params.Bookmarks = profileData.bookmarks;
      const res = await get("/api/profile-snippet-data", params);
      setSnippetData(
        [
          { tabName: "Contributions", tabData: res.Contributions },
          { tabName: "Favorites", tabData: res.Favorites },
        ].concat(profileId === viewer._id ? [{ tabName: "Bookmarks", tabData: res.Bookmarks }] : [])
      );
      let userIds = [];
      for (const field in res) {
        for (const snippetObj of res[field]) userIds.push(snippetObj.authorId);
      }
      setAuthorToPic(await get("/api/profile-pictures", { userIds: userIds }));
    };
    getProfileData().then((res) => {
      getProfileSnippetData(res);
    });
  }, [profileId]);

  return (
    <>
      {!snippetData || !authorToPic ? (
        <div className="Loading">Loading</div>
      ) : (
        <div className="Profile-container">
          <ProfilePersonalInfo
            name={data.name}
            bio={data.bio}
            profilePicURL={data.pictureURL}
            isViewer={viewer._id === profileId}
            allFriends={data.friends}
            goTo={goTo}
          />
          <SnippetDisplay
            viewer={viewer}
            goTo={goTo}
            snippets={snippetData}
            authorToPic={authorToPic}
            maxPerPage={MAX_SNIPPETS_PER_PAGE}
            popupHandlers={popupHandlers}
          />
        </div>
      )}
    </>
  );
};

export default Profile;
