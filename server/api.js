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

router.get("/snippets", (req, res) => {
  console.log(`api called, grabbing several snippets for user with id ${req.query.userId}`);
  const getSnippets = async () => {
    const snippetList = await Snippet.find({ authorId: req.query.userId });
    res.send(snippetList);
  };
  getSnippets();
});

router.get("/treeview", (req, res) => {
  console.log("api called, finding snippet with id " + req.query._id);
  const getTree = async () => {
    const snippet = await Snippet.findById(req.query._id).catch(() => {
      console.log("snippet does not exist");
      res.send({});
    });
    const snippetList = await Snippet.find({ rootId: snippet.rootId });
    res.send(
      snippetList.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {})
    );
  };
  getTree();
});

router.post("/new-snippet", (req, res) => {
  console.log("posting snippet to DB");
  auth.ensureLoggedIn(req, res, () => {
    console.log("from post: user is indeed logged in");
    const leaf = new Snippet({
      authorName: req.body.authorName,
      authorId: req.body.authorId,
      content: req.body.input,
      children: [],
      parentId: req.body.parentId,
      rootId: req.body.rootId,
    });
    leaf.save().then((snippet) => {
      res.send(snippet);
      //add to parent snippet's children
      Snippet.findById(req.body.parentId).then((parent) => {
        parent.children.push(snippet._id);
        parent.save();
      });
      //add to author's contribs
      User.findById(snippet.authorId).then((user) => {
        user.contribs.push(snippet._id);
        user.save();
      });
    });
  });
});

router.get("/profile", (req, res) => {
  console.log("getting profile data of user " + req.query.id);
  User.findById(req.query.id)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/profile-snippet-data", (req, res) => {
  console.log("getting snippet data");
  console.log(req.query);
  const query = async (field) => {
    const ids = req.query[field];
    if (ids === "") return [];
    return Snippet.find({ _id: { $in: ids.split(",") } }).catch((err) => {
      res.status(400).send(err);
    });
  };
  const queryDB = async () => {
    ret = {};
    for (const field in req.query) {
      const list = await query(field);
      if (!list) return; //in case error occurred in query
      ret[field] = list;
    }
    res.send(ret);
  };
  queryDB();
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
