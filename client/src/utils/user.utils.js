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

const initializeUser = (setter, user) => {
  console.log("initializing user " + user.name);
  let useDefaultSettings = false;
  if (!user.settings || Object.keys(user.settings).length < 7) {
    useDefaultSettings = true;
    console.log("user settings not set, using default");
    populateSettings(DEFAULT_SETTINGS);
  }

  setter({
    _id: user._id,
    name: user.name,
    pictureURL: user.pictureURL,
    bookmarks: new Set(user.bookmarks),
    favorites: new Set(user.favorites),
    friends: new Set(user.friends),
    settings: useDefaultSettings ? DEFAULT_SETTINGS : user.settings,
  });
};
export { DEFAULT_SETTINGS, ANONYMOUS_USER, populateSettings, initializeUser };
