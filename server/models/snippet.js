const mongoose = require("mongoose");

const snippetScheme = new mongoose.Schema({
  author_name: String,
  author_id: String,
  parent_id: String,
  root_id: String,
  children_id: [String],
  content: String,
});

module.exports = mongoose.model("snippet", snippetScheme);
