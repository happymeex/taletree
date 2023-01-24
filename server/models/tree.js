const mongoose = require("mongoose");

const Tree = new mongoose.Schema({
  snippets: [String],
});

module.exports = mongoose.model("tree", Tree);
