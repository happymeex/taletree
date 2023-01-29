const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  bio: String,
  contribs: [String],
  favorites: [String],
  bookmarks: [String],
  pictureURL: String,
  friends: [String],
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
