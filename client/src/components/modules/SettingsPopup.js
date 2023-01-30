import React from "react";
import "./Popup.css";
import { populateSettings } from "../../utils/user.utils";

const SETTINGS = [
  "authorVisible",
  "showContributions",
  "showFavorites",
  "showBookmarks",
  "showFollowing",
  "goToTreeViewAfterPost",
];
const SETTING_LABELS = [
  [
    "Show author labels",
    "Decide whether author names and profile pictures display next to snippet text.",
  ],
  ["Show contributions", "Display snippets you wrote publicly on your profile."],
  ["Show favorites", "Display favorited snippets publicly on your profile."],
  ["Show bookmarks", "Display snippets publicly on your profile."],
  ["Show following", "Display followed accounts on your profile."],
  ["Open tree view after posting", "Automatically navigate to tree view after posting a snippet."],
];
const SettingsPopup = ({ setViewer, settings }) => {
  console.log("Settings popup rerendered, got settings");
  console.log(settings);
  const updateSetting = (attrib, value) => {
    console.log("updating to " + value);
    let newSettings = structuredClone(settings); //a deep copy isn't necessary atm but in case we have more complex settings
    newSettings[attrib] = value;
    populateSettings(newSettings);
    setViewer((v) => {
      let newViewer = structuredClone(v);
      newViewer.settings = newSettings;
      return newViewer;
    });
  };

  let togglers = [];
  for (const attrib of SETTINGS)
    togglers.push((e) => {
      updateSetting(attrib, e.target.checked);
    });

  let checkBoxes = togglers.map((handler, i) => {
    let attrib = SETTINGS[i];
    return (
      <div key={attrib} className="SettingsPopup-settingWrapper u-flex">
        <input
          className="SettingsPopup-checkbox"
          id={attrib}
          type="checkbox"
          onChange={handler}
          checked={settings[attrib]}
        ></input>
        <label htmlFor={attrib}>
          <span className="SettingsPopup-settingHeader">{SETTING_LABELS[i][0]}</span>
          <br></br>
          <span className="SettingsPopup-settingDescription">{SETTING_LABELS[i][1]}</span>
        </label>
      </div>
    );
  });
  return (
    <div className="PopupViewer-container PopupViewer-large u-flexColumn">
      <div className="Popup-header u-flex-justifyCenter u-flex-alignCenter">Settings</div>
      {checkBoxes}
    </div>
  );
};

export default SettingsPopup;
