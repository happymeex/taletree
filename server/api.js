/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Snippet = require("./models/snippet");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.get("/treeview", (req, res) => {
  console.log("api called, finding snippet with id " + req.query._id);
  const getTree = async () => {
    const snippet = await Snippet.findById(req.query._id).catch(() => {
      console.log("snippet does not exist");
      res.send({});
    });
    const snippetList = await Snippet.find({ rootId: snippet.rootId });
    res.send({
      rootId: snippet.rootId,
      tree: snippetList.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {}),
    });
  };
  getTree();
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
