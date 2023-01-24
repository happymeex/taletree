import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import ProfileSnippet from "./ProfileSnippet";

/**
 * clickable tab to toggle viewable snippets: contribs, favs, or bookmarks
 */
const ProfileContentTab = ({ text, onClick, isSelected }) => {
  return (
    <div
      className="ProfileContent-tab"
      style={
        isSelected
          ? { backgroundColor: `var(--primary--dim)`, fontWeight: `900`, color: `black` }
          : {}
      }
      onClick={onClick}
    >
      {text}
    </div>
  );
};

/**
 * box for displaying the snippets, reverse chronologically.
 * we might want to display something fun if there aren't any
 * snippets to display
 */
const ProfileContentSnippetViewer = ({ snippetList }) => {
  const snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .map((obj, i) => (
      <>
        <hr className="ProfileContent-separator" />
        <ProfileSnippet content={obj.content} />
      </>
    ));
  snippets.push(<hr className="ProfileContent-separator" />);
  return (
    <div className="ProfileContentSnippetViewer-container">
      {snippetList.length === 0 ? <></> : snippets}
    </div>
  );
};

/**
 * right portion of profile page (bottom portion on mobile, underneath ProfilPersonalInfo)
 * viewer can see contributions, favs, and (if isViewer, i.e. own profile) bookmarks
 *
 * @param {[String]} contribs
 * @param {[String]} favorites
 * @param {[String]} bookmarks
 * @param {Boolean} isViewer
 * @returns
 */
const ProfileContent = ({ contribs, favorites, bookmarks, isViewer }) => {
  const [data, setData] = useState(undefined);
  const [currTab, setCurrTab] = useState(0);
  useEffect(() => {
    const getData = async () => {
      const res = await get("/api/profile-snippet-data", {
        0: contribs,
        1: favorites,
        2: bookmarks,
      });
      console.log("got data: ");
      console.log(res);
      setData(res);
    };
    getData();
  }, []);

  const tabs = ["Contributions", "Favorites"].concat(isViewer ? ["Bookmarks"] : []);
  let tabList = tabs.map((t, i) => (
    <ProfileContentTab
      key={i}
      text={t}
      onClick={() => {
        setCurrTab(i);
      }}
      isSelected={currTab === i}
    />
  ));
  return (
    <div className="ProfileContent-container">
      <div className="ProfileContent-tabBar u-flex">{tabList}</div>
      {!data ? (
        <div className="Loading">Loading...</div>
      ) : (
        <ProfileContentSnippetViewer snippetList={data[currTab]} />
      )}
    </div>
  );
};

export default ProfileContent;
