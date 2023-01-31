import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import ProfilePersonalInfo from "../modules/ProfilePersonalInfo";
import SnippetDisplay from "../modules/SnippetDisplay";

import "./Profile.css";
import { checkSettings, populateSettings } from "../../utils/user.utils";

const MAX_SNIPPETS_PER_PAGE = 10;
const TABS = [
  ["Contributions", "contribs"],
  ["Favorites", "favorites"],
  ["Bookmarks", "bookmarks"],
];

/**
 * Profile page.
 *
 * proptypes
 * @param {String} profileId the profile's id
 * @param {Object} viewer the viewer
 * @param {Object} goTo navigation functions
 * @param {Object} popupHandlers
 * @param {Function} setViewer
 */
const Profile = ({ profileId, viewer, goTo, popupHandlers, setViewer }) => {
  const [data, setData] = useState(undefined);
  const [snippetData, setSnippetData] = useState(undefined);
  const [authorToPic, setAuthorToPic] = useState(undefined);
  const [profileSettings, setProfileSettings] = useState(undefined);

  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getProfileData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got profile data:");
      console.log(res);
      const settings = checkSettings(res.settings, res._id);
      setProfileSettings(settings);
      setData(res);
      return { profileData: res, settings: settings };
    };
    const getProfileSnippetData = async ({ profileData, settings }) => {
      let visibleTabs =
        profileId === viewer._id ? TABS : TABS.filter((tab) => settings["show" + tab[0]]);
      let params = {};
      for (const tab of visibleTabs) params[tab[0]] = profileData[tab[1]];

      const res = await get("/api/profile-snippet-data", params);
      visibleTabs = visibleTabs.map((tab) => {
        return {
          tabName: tab[0],
          tabData: res[tab[0]],
        };
      });
      setSnippetData(visibleTabs);
      let userIds = [];
      for (const field in res) {
        for (const snippetObj of res[field]) userIds.push(snippetObj.authorId);
      }
      console.log("User ids for the snippets on this profile page:");
      console.log(new Set(userIds));
      setAuthorToPic(await get("/api/profile-pictures", { userIds: userIds }));
    };
    getProfileData().then((res) => {
      getProfileSnippetData(res);
    });
  }, [profileId]);

  return (
    <>
      {!snippetData || !authorToPic || !profileSettings ? (
        <div className="Loading"></div>
      ) : (
        <div className="Profile-container">
          <ProfilePersonalInfo
            profileId={profileId}
            profileSettings={profileSettings}
            name={data.name}
            bio={data.bio}
            profilePicURL={data.pictureURL}
            viewer={viewer}
            setAuthorToPic={setAuthorToPic}
            allFriends={data.friends}
            goTo={goTo}
          />
          <div className="Profile-snippetDisplayWrapper">
            <SnippetDisplay
              viewer={viewer}
              goTo={goTo}
              snippets={snippetData}
              authorToPic={authorToPic}
              maxPerPage={MAX_SNIPPETS_PER_PAGE}
              popupHandlers={popupHandlers}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
