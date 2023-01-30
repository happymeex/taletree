const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  authorVisible: Boolean,
  showFollowing: Boolean,
  showBookmarks: Boolean,
  showContributions: Boolean,
  showFavorites: Boolean,
  goToTreeViewAfterPost: Boolean,
});

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  bio: String,
  contribs: [String],
  favorites: [String],
  bookmarks: [String],
  pictureURL: String,
  friends: [String],
  settings: SettingsSchema,
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
