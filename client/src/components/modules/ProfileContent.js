import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import SingleSnippet from "./SingleSnippet.js";
import "../pages/Profile.css";

/**
 * clickable tab to toggle viewable snippets: contribs, favs, or bookmarks
 */
const ProfileContentTab = ({ text, onClick, isSelected }) => {
  console.log(`here`);
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
const ProfileContentSnippetViewer = ({ snippetList, userFavorites, userBookmarks }) => {
  const snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .map((snippet, i) => (
      <>
        <SingleSnippet
          authorName={snippet.authorName}
          authorId={snippet.authorId}
          content={snippet.content}
          _id={snippet._id}
          isTreeView={false}
          showAuthor={true}
          isFavorite={userFavorites.has(snippet._id)}
          isBookmarked={userBookmarks.has(snippet._id)}
          showIconBar={true}
        />
      </>
    ));
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
 * @param {[String]} userFavorites
 * @param {[String]} userBookmarks
 * @returns
 */
const ProfileContent = (props) => {
  const [data, setData] = useState(undefined);
  const [currTab, setCurrTab] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const res = await get("/api/profile-snippet-data", {
        0: props.contribs,
        1: props.favorites,
        2: props.bookmarks,
      });
      console.log("got data: ");
      console.log(res);
      setData(res);
    };
    getData();
  }, [props]);

  const tabs = ["Contributions", "Favorites"].concat(props.isViewer ? ["Bookmarks"] : []);
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
  //let liked = new Set(data[1]);
  //let bookmarked = new Set(data[2]);
  return (
    <div className="ProfileContent-container">
      <div className="ProfileContent-tabBar u-flex">{tabList}</div>
      {!data ? (
        <div className="Loading">Loading...</div>
      ) : (
        <ProfileContentSnippetViewer
          snippetList={data[currTab]}
          userFavorites={props.userFavorites}
          userBookmarks={props.userBookmarks}
        />
      )}
    </div>
  );
};

export default ProfileContent;
