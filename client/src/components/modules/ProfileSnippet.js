import React from "react";
import "./ProfileSnippet.css";

const ProfileSnippet = ({ content }) => {
  return (
    <div className="ProfileSnippet-container">
      <div className="ProfileSnippet-contentBox">{content}</div>
    </div>
  );
};

export default ProfileSnippet;
