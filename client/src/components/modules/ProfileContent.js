import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import SingleSnippet from "./SingleSnippet.js";
import "../pages/Profile.css";

const TAB_ORDER = ["contribs", "favorites", "bookmarks"];
const MAX_SNIPPETS_PER_PAGE = 3;

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

const PageBar = ({ page, totalPages, onClick }) => {
  return (
    <div className="ProfileContentSnippetViewer-pageBar u-flex-end">
      {page > 1 && (
        <span
          onClick={() => {
            onClick(-1);
          }}
          className="u-clickable"
        >
          Prev
        </span>
      )}
      {page > 1 && <span>{page - 1}</span>}
      <span className="u-bold">{page}</span>
      {page < totalPages && <span>{page + 1}</span>}
      {page < totalPages - 1 && <span>...</span>}
      {page < totalPages && (
        <span
          onClick={() => {
            onClick(1);
          }}
          className="u-clickable"
        >
          Next
        </span>
      )}
    </div>
  );
};

/**
 * box for displaying the snippets, reverse chronologically.
 * we might want to display something fun if there aren't any
 * snippets to display
 */
const ProfileContentSnippetViewer = ({ viewerId, snippetList, updateLocalViewer, goTo }) => {
  const [page, setPage] = useState(0);
  console.log("rendering page with snippet list");
  console.log(snippetList);

  useEffect(() => {
    console.log("resetting page");
    setPage(0);
  }, [snippetList]);

  const totalPages = Math.ceil(snippetList.length / MAX_SNIPPETS_PER_PAGE);
  const snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .slice(page * MAX_SNIPPETS_PER_PAGE, (page + 1) * MAX_SNIPPETS_PER_PAGE)
    .map((snippet, i) => (
      <SingleSnippet
        key={snippet._id}
        authorName={snippet.authorName}
        authorId={snippet.authorId}
        viewerId={viewerId}
        content={snippet.content}
        _id={snippet._id}
        isTreeView={false}
        showAuthor={true}
        status={snippet.status}
        showIconBar={true}
        goTo={goTo}
        updateLocalViewer={updateLocalViewer}
      />
    ));
  return (
    <>
      <div className="ProfileContentSnippetViewer-container">
        {snippetList.length === 0 ? <></> : snippets}
      </div>
      {snippetList.length > MAX_SNIPPETS_PER_PAGE && (
        <PageBar
          page={page + 1}
          totalPages={totalPages}
          onClick={(delta) => {
            setPage((x) => x + delta);
          }}
        />
      )}
    </>
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
 * @param {Object} viewer
 * @param {Object} goTo navigation functions
 * @returns
 */
const ProfileContent = (props) => {
  const [data, setData] = useState(undefined);
  const [currTab, setCurrTab] = useState(0);
  const [localViewer, setLocalViewer] = useState(props.viewer);

  console.log("local viewer: ");
  console.log(localViewer.favorites);
  console.log(localViewer.bookmarks);

  useEffect(() => {
    console.log("data lists");
    console.log(props.contribs);
    console.log(props.favorites);
    console.log(props.bookmarks);
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

  const updateLocalViewer = (attrib, id, action) => {
    console.log("updating!");
    setLocalViewer((v) => {
      if (action === "add") {
        v[attrib].add(id);
      } else if (action === "delete") {
        v[attrib].delete(id);
      }
      return v;
    });
  };

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

  let snippetList = undefined;
  if (data) {
    snippetList = data[currTab].map((snippet) => {
      snippet.status = {
        isFavorite: localViewer.favorites.has(snippet._id),
        isBookmark: localViewer.bookmarks.has(snippet._id),
      };
      return snippet;
    });
    //Let's not try to update as we change tabs -- only update on refresh.
    //if (props.isViewer && currTab === 1)
    //  snippetList = snippetList.filter((snippet) => snippet.status.isFavorite);
    //else if (props.isViewer && currTab === 2)
    //  snippetList = snippetList.filter((snippet) => snippet.status.isBookmark);
  }

  return (
    <div className="ProfileContent-container">
      <div className="ProfileContent-tabBar u-flex">{tabList}</div>
      {!snippetList ? (
        <div className="Loading">Loading...</div>
      ) : (
        <ProfileContentSnippetViewer
          viewerId={props.viewer._id}
          snippetList={snippetList}
          updateLocalViewer={updateLocalViewer}
          goTo={props.goTo}
        />
      )}
    </div>
  );
};

export default ProfileContent;
