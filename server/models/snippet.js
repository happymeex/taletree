const mongoose = require("mongoose");

const snippetScheme = new mongoose.Schema({
  authorName: String,
  authorId: String,
  parentId: String,
  rootId: String,
  children: [String],
  content: String,
});

module.exports = mongoose.model("snippet", snippetScheme);
