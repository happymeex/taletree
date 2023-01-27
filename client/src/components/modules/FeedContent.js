import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import SingleSnippet from "./SingleSnippet.js";
import "../pages/Profile.css";

const MAX_SNIPPETS_PER_PAGE = 6;

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
const ProfileContentSnippetViewer = ({ snippetList, viewer }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(snippetList.length / MAX_SNIPPETS_PER_PAGE);
  const snippets = snippetList
    .slice() //clone array so that it isn't mutated by reverse
    .reverse()
    .slice(page * MAX_SNIPPETS_PER_PAGE, (page + 1) * MAX_SNIPPETS_PER_PAGE)
    .map((snippet, i) => (
      <SingleSnippet
        key={i}
        authorName={snippet.authorName}
        authorId={snippet.authorId}
        content={snippet.content}
        _id={snippet._id}
        isTreeView={false}
        showAuthor={true}
        viewer={viewer}
        showIconBar={true}
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
 * @param {Object} snippets
 * @param {Object} viewer
 * @returns
 */
const FeedContent = ({ snippets, viewer }) => {
  const [currTab, setCurrTab] = useState(0);
  const tabs = ["New", "Most Popular"];

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
      {!snippets ? (
        <div className="Loading">Loading...</div>
      ) : (
        <ProfileContentSnippetViewer snippetList={snippets[currTab]} viewer={viewer} />
      )}
    </div>
  );
};

export default FeedContent;
