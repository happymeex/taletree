import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import SingleSnippet from "./SingleSnippet.js";
import "../pages/Profile.css";
import "./SnippetDisplay.css";

const MAX_SNIPPETS_PER_PAGE = 6;

/**
 * clickable tab to toggle viewable snippets: contribs, favs, or bookmarks
 */
const TabBar = ({ text, onClick, isSelected }) => {
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

const PageBarNumber = ({ value, onClick, isSelected }) => {
  const style = isSelected
    ? {
        color: `black`,
        backgroundColor: `var(--primary--dim)`,
        outline: `1px solid var(--medgrey)`,
      }
    : {};
  return (
    <div className="PageBarNumber u-clickable u-darken" onClick={onClick} style={style}>
      {value}
    </div>
  );
};

const PageBar = ({ page, totalPages, tabNumber, onClick }) => {
  const lbound = Math.max(1, page - 2);
  const ubound = Math.min(totalPages, page + 2);
  let numList = [];
  for (let i = lbound; i <= ubound; i++) {
    numList.push(
      <PageBarNumber
        key={`${tabNumber},${i}`}
        value={i}
        onClick={() => onClick(i - page)}
        isSelected={page === i}
      />
    );
  }
  return (
    <div className="SnippetDisplay-pageBar u-flex-end">
      {page > 1 && (
        <PageBarNumber
          value="Prev"
          onClick={() => {
            onClick(-1);
          }}
        />
      )}
      {page > 3 && <span>...</span>}
      {numList}
      {page < totalPages - 2 && <span>...</span>}
      {page < totalPages && <PageBarNumber value="Next" onClick={() => onClick(1)} />}
    </div>
  );
};

/**
 * box for displaying the snippets, reverse chronologically.
 * we might want to display something fun if there aren't any
 * snippets to display
 */
const SnippetDisplayContent = ({
  viewerId,
  snippetList,
  updateLocalViewer,
  goTo,
  maxPerPage,
  authorToPic,
  popupHandlers,
  tabNumber,
}) => {
  const [page, setPage] = useState(0);
  const [pageTracker, setPageTracker] = useState({});
  console.log("rendering page with snippet list");
  console.log(snippetList);

  useEffect(() => {
    if (!(tabNumber in pageTracker)) {
      setPageTracker((obj) => {
        obj[tabNumber] = 0;
        return obj;
      });
      setPage(0);
    } else setPage(pageTracker[tabNumber]);
  }, [tabNumber]);

  const totalPages = Math.ceil(snippetList.length / maxPerPage);
  const snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .slice(page * maxPerPage, (page + 1) * maxPerPage)
    .map((snippet, i) => (
      <SingleSnippet
        key={snippet._id}
        author={{
          name: snippet.authorName,
          id: snippet.authorId,
          pictureURL: authorToPic[snippet.authorId],
        }}
        viewerId={viewerId}
        content={snippet.content}
        _id={snippet._id}
        isTreeView={false}
        showAuthor={true}
        status={snippet.status}
        showIconBar={true}
        goTo={goTo}
        updateLocalViewer={updateLocalViewer}
        popupHandlers={popupHandlers}
      />
    ));
  return (
    <div className="SnippetDisplay-snippetAndPageBarWrapper">
      <div className="SnippetDisplay-snippetContainer">
        {snippetList.length === 0 ? <></> : snippets}
      </div>
      {snippetList.length > maxPerPage && (
        <PageBar
          page={page + 1}
          totalPages={totalPages}
          onClick={(delta) => {
            setPage((x) => x + delta);
            setPageTracker((obj) => {
              obj[tabNumber] += delta;
              return obj;
            });
          }}
          tabNumber={tabNumber}
        />
      )}
    </div>
  );
};

/**
 * right portion of profile page (bottom portion on mobile, underneath ProfilPersonalInfo)
 * viewer can see contributions, favs, and (if isViewer, i.e. own profile) bookmarks
 *
 * @param {Object} viewer
 * @param {Object} goTo navigation functions
 * @param {[Object]} snippets an array of objects of the form
 *  {tabName: String, tabData: [Object]} where the value of the second field is a list of snippet objects
 * @param {Object} authorToPic an object mapping user ids to profile picture URLs
 * @param {Number} maxPerPage
 * @param {Object} popupHandlers
 */
const SnippetDisplay = (props) => {
  const [data, setData] = useState(undefined);
  const [currTab, setCurrTab] = useState(0);
  const [localViewer, setLocalViewer] = useState(props.viewer);

  console.log("Got snippets: ");
  console.log(props.snippets);

  useEffect(() => {
    let d = {};
    for (let i = 0; i < props.snippets.length; i++) d[i] = props.snippets[i];

    setData(d);
  }, [props]);

  console.log("local viewer: ");
  console.log(localViewer.favorites);
  console.log(localViewer.bookmarks);

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

  let tabList = props.snippets.map((t, i) => (
    <TabBar
      key={i}
      text={t.tabName}
      onClick={() => {
        setCurrTab(i);
      }}
      isSelected={currTab === i}
    />
  ));

  let snippetList = undefined;
  if (data) {
    snippetList = data[currTab].tabData.map((snippet) => {
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
    <div className="SnippetDisplay-container">
      <div className="ProfileContent-tabBar u-flex">{tabList}</div>
      {!snippetList ? (
        <div className="Loading">Loading...</div>
      ) : (
        <SnippetDisplayContent
          viewerId={props.viewer._id}
          snippetList={snippetList}
          authorToPic={props.authorToPic}
          updateLocalViewer={updateLocalViewer}
          goTo={props.goTo}
          maxPerPage={props.maxPerPage}
          popupHandlers={props.popupHandlers}
          tabNumber={currTab}
        />
      )}
    </div>
  );
};

export default SnippetDisplay;
