import { get, post } from "../utilities";
const DEFAULT_SETTINGS = {
  authorVisible: true,
  showBookmarks: false,
  showContributions: true,
  showFavorites: true,
  showFollowing: true,
  goToTreeViewAfterPost: true,
};
const ANONYMOUS_USER = {
  _id: null,
  name: null,
  pictureURL: null,
  bookmarks: new Set(),
  favorites: new Set(),
  friends: new Set(),
  settings: DEFAULT_SETTINGS,
};

const populateSettings = async (settings, id) => {
  const params = { settings: settings };
  if (id) params._id = id;
  post("/api/update-settings", params);
};

const checkSettings = (settings, id) => {
  if (!settings || Object.keys(settings).length < 7) {
    console.log("profile id " + id + " doesn't have proper settings, giving them default");
    populateSettings(DEFAULT_SETTINGS, id);
    return DEFAULT_SETTINGS;
  }
  console.log("settings ok");
  return settings;
};

const initializeUser = (setter, user) => {
  console.log("initializing user " + user.name);
  const settings = checkSettings(user.settings, user._id);

  setter({
    _id: user._id,
    name: user.name,
    pictureURL: user.pictureURL,
    bookmarks: new Set(user.bookmarks),
    favorites: new Set(user.favorites),
    friends: new Set(user.friends),
    settings: settings,
  });
};
export { DEFAULT_SETTINGS, ANONYMOUS_USER, populateSettings, checkSettings, initializeUser };
