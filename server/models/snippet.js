const mongoose = require("mongoose");

const snippetScheme = new mongoose.Schema({
  authorName: String,
  authorId: String,
  parentId: String,
  treeId: String,
  children: [String],
  content: String,
  numLikes: Number,
});

module.exports = mongoose.model("snippet", snippetScheme);
