import React, { useState, useEffect } from "react";
import SingleSnippet from "./SingleSnippet.js";
import "../pages/Profile.css";
import "./SearchBar.css";

const MAX_SNIPPETS_PER_PAGE = 6;
import "./SnippetDisplay.css";

/**
 * clickable tab to toggle viewable snippets
 */
const TabBar = ({ text, onClick, isSelected }) => {
  return (
    <div
      className="SnippetDisplay-tab u-clickable"
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

const PageBar = ({ pageTracker, totalPages, tabNumber, onClick }) => {
  const { page, l, r } = pageTracker;
  let numList = [];
  for (let i = l; i <= r; i++) {
    numList.push(
      <PageBarNumber
        key={`${tabNumber},${i}`}
        value={i}
        onClick={() => onClick(i)}
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
            onClick(page - 1);
          }}
        />
      )}
      {l > 1 && <span>...</span>}
      {numList}
      {r < totalPages && <span>...</span>}
      {page < totalPages && <PageBarNumber value="Next" onClick={() => onClick(page + 1)} />}
    </div>
  );
};

//silly helper function
const initializeTracker = (n, totalPages) => {
  let obj = {};
  obj[n] = { page: 1, l: 1, r: Math.min(3, totalPages) };
  return obj;
};

/**
 * box for displaying the snippets, reverse chronologically, along with a page bar
 * for navigation. we might want to display something fun if there aren't any
 * snippets to display
 */
const SnippetDisplayContent = ({
  viewerId,
  settings,
  snippetList,
  search,
  updateLocalViewer,
  goTo,
  maxPerPage,
  authorToPic,
  popupHandlers,
  tabNumber,
}) => {
  const [pageTracker, setPageTracker] = useState(
    initializeTracker(tabNumber, snippetList.length / maxPerPage)
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("initializing page tracker");
    const totalPages = Math.ceil(snippetList.length / maxPerPage);
    if (!(tabNumber in pageTracker)) {
      setPageTracker((obj) => {
        console.log("setting page tracker");
        obj[tabNumber] = { page: 1, l: 1, r: Math.min(3, totalPages) };
        return obj;
      });
    }
  }, [tabNumber]);

  useEffect(() => {
    setReady(true);
    console.log("ready!");
  }, [pageTracker]);

  const totalPages = Math.ceil(snippetList.length / maxPerPage);
  const default_tracker = { page: 1, l: 1, r: Math.min(3, totalPages) };
  const tracker = pageTracker[tabNumber] ? pageTracker[tabNumber] : default_tracker;

  let snippets = null;
  snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .slice((tracker.page - 1) * maxPerPage, tracker.page * maxPerPage)
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
        search={search}
        _id={snippet._id}
        isTreeView={false}
        settings={settings}
        status={snippet.status}
        showIconBar={true}
        goTo={goTo}
        numLikes={snippet.numLikes}
        updateLocalViewer={updateLocalViewer}
        popupHandlers={popupHandlers}
      />
    ));

  return (
    <div className="SnippetDisplay-snippetAndPageBarWrapper">
      {snippetList.length === 0 ? (
        <div className="SpecialCenterText">Nothing to see here!</div>
      ) : (
        <>
          <div className="SnippetDisplay-snippetContainer">
            {ready ? snippets : <div className="Loading"></div>}
          </div>
          {ready && snippetList.length > maxPerPage && (
            <PageBar
              pageTracker={tracker}
              totalPages={totalPages}
              onClick={(newPage) => {
                setReady(false);
                setPageTracker((obj) => {
                  if (newPage > obj[tabNumber].r)
                    obj[tabNumber] = {
                      l: Math.max(1, newPage - 4),
                      r: newPage,
                    };
                  if (newPage < obj[tabNumber].l)
                    obj[tabNumber] = {
                      l: newPage,
                      r: Math.min(totalPages, newPage + 4),
                    };
                  obj[tabNumber].page = newPage;
                  return Object.assign({}, obj);
                });
              }}
              tabNumber={tabNumber}
            />
          )}
        </>
      )}
    </div>
  );
};

const SearchBar = ({ setSearchInput, initialText }) => {
  return (
    <input
      type="text"
      className="SearchBar-textbox"
      value={initialText}
      placeholder="Search snippets"
      onChange={(e) => {
        setSearchInput(e.target.value);
      }}
    />
  );
};

/**
 * Tabbed display box for snippets. used for feed and profile
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
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let d = {};
    for (let i = 0; i < props.snippets.length; i++) d[i] = props.snippets[i];

    setData(d);
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
  if (data && props.snippets.length > 0) {
    snippetList = data[currTab].tabData.map((snippet) => {
      snippet.status = {
        isFavorite: localViewer.favorites.has(snippet._id),
        isBookmark: localViewer.bookmarks.has(snippet._id),
      };
      return snippet;
    });
  }

  if (searchInput !== "" && props.snippets.length > 0) {
    snippetList = snippetList.filter((snippet) => {
      return (
        snippet.authorName != "GOD" &&
        (snippet.authorName.toLowerCase().includes(searchInput.toLowerCase()) ||
          snippet.content.toLowerCase().includes(searchInput.toLowerCase()))
      );
    });
  }

  //Let's not try to update as we change tabs -- only update on refresh.
  //if (props.isViewer && currTab === 1)
  //  snippetList = snippetList.filter((snippet) => snippet.status.isFavorite);
  //else if (props.isViewer && currTab === 2)
  //  snippetList = snippetList.filter((snippet) => snippet.status.isBookmark);

  return (
    <div className="SnippetDisplay-container">
      {props.snippets.length === 0 ? (
        <div className="SpecialCenterText">This user has hidden everything!</div>
      ) : (
        <>
          <div className="u-flex">
            <SearchBar setSearchInput={setSearchInput} initialText={searchInput} />
          </div>
          <div className="SnippetDisplay-tabBar u-flex">{tabList}</div>
          {!snippetList ? (
            <div className="Loading"></div>
          ) : (
            <SnippetDisplayContent
              viewerId={props.viewer._id}
              settings={{
                authorVisible: props.viewer.settings.authorVisible,
                showSnippetLikes: props.viewer.settings.showSnippetLikes,
              }}
              snippetList={snippetList}
              search={searchInput !== "" ? [searchInput] : null}
              authorToPic={props.authorToPic}
              updateLocalViewer={updateLocalViewer}
              goTo={props.goTo}
              maxPerPage={props.maxPerPage}
              popupHandlers={props.popupHandlers}
              tabNumber={currTab}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SnippetDisplay;
