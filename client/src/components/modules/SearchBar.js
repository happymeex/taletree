import React from "react";
import "./SearchBar.css";
import lookup from "../../public/lookup.svg";

/**
 * @param {(input:String) => void} onSearch
 */
const SearchBar = (props) => {
  return (
    <div className="SearchBar-container">
      <form action="/api/search" method="get" className="SearchBar-form">
        <input
          type="text"
          id="SearchBar-textbox"
          className="SearchBar-textbox"
          placeholder="Search for snippets"
        />
        <button type="submit">
          <img src={lookup} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
