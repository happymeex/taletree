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
const Tree = require("./models/tree");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

//returns an object mapping user ids to profile picture URLs
router.get("/profile-pictures", (req, res) => {
  const queryDB = async () => {
    if (req.query.userIds === "") {
      res.send({});
      return;
    }
    const users = await User.find({ _id: { $in: req.query.userIds.split(",") } }).lean();

    res.send(
      users.reduce((acc, curr) => {
        acc[curr._id] = curr.pictureURL;
        return acc;
      }, {})
    );
  };
  queryDB();
});

router.post("/new-tree", (req, res) => {
  console.log("making new tree");
  auth.ensureLoggedIn(req, res, () => {
    const tree = new Tree({ snippets: [] });
    tree.save().then((ret) => {
      res.send(ret._id);
    });
  });
});

router.get("/snippets", (req, res) => {
  console.log(`api called, grabbing several snippets for user with id ${req.query.userId}`);
  const userPresent = req.query.userId !== "null";
  const getSnippets = async () => {
    const likedSnippets = await Snippet.find({ _id: { $ne: "63d04ff67f9ad37d137f7750" } }).sort({
      numLikes: 1,
      _id: 1,
    });
    const recentSnippets = await Snippet.find({ _id: { $ne: "63d04ff67f9ad37d137f7750" } }).sort({
      _id: 1,
    });

    let toSend = [
      { tabName: "New", tabData: recentSnippets },
      { tabName: "Most Popular", tabData: likedSnippets },
    ];
    if (userPresent) {
      const user = await User.findById(req.query.userId);
      const friends = new Set(user.friends);
      const followedSnippets = likedSnippets.filter((snippet) => friends.has(snippet.authorId));
      toSend = toSend.concat({ tabName: "For You", tabData: followedSnippets });
    }
    //res.send({ 1: likedSnippets, 0: recentSnippets });
    res.send(toSend);
  };
  getSnippets();
});

router.get("/treeview", (req, res) => {
  console.log("api called, finding snippet with id " + req.query._id);
  const getTree = async () => {
    let flag = false;
    const snippet = await Snippet.findById(req.query._id)
      .lean()
      .catch((err) => {
        res.status(400).send({ msg: "Invalid snippet id" });
        flag = true;
      });

    if (!snippet) {
      if (!flag) res.status(404).send({ msg: "Snippet not found" });
      return;
    }
    const tree = await Tree.findById(snippet.treeId).catch((err) => {
      res.status(500).send({ msg: "Database error: snippet has no corresponding tree" });
      flag = true;
    });
    if (tree && !flag) {
      const snippetList = await Snippet.find({ _id: { $in: tree.snippets } }).lean();
      res.send(
        snippetList.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {})
      );
    }
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
      numLikes: 0,
      parentId: req.body.parentId,
      treeId: req.body.treeId,
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
      //add to tree
      Tree.findById(snippet.treeId).then((tree) => {
        tree.snippets.push(snippet._id);
        tree.save();
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

router.get("/users", (req, res) => {
  const query = async () => {
    if (req.query.ids === "") {
      res.send([]);
      return;
    }
    const ret = await User.find({ _id: { $in: req.query.ids.split(",") } }).catch((err) => {
      res.status(400).send(err);
      return;
    });
    res.send(ret);
  };
  query();
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
  let promises = [];
  let fields = [];
  for (const field in req.query) {
    const list = query(field);
    promises.push(list);
    fields.push(field);
  }
  let ret = {};
  Promise.all(promises).then((values) => {
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) return; //in case error occurred in query
      ret[fields[i]] = values[i];
    }
    res.send(ret);
  });
});

router.post("/snippet-attribs", (req, res) => {
  console.log("changing user's favorites/bookmarks");
  auth.ensureLoggedIn(req, res, () => {
    const updateDB = async () => {
      const user = await User.findById(req.body.viewerId);
      const snippet = await Snippet.findById(req.body._id);
      if (req.body.state) {
        user[req.body.attrib].push(req.body._id);
        snippet["numLikes"] += req.body.attrib === "favorites" ? 1 : 0;
      } else {
        user[req.body.attrib] = user[req.body.attrib].filter((s) => s !== req.body._id);
        snippet["numLikes"] += req.body.attrib === "favorites" ? -1 : 0;
      }
      snippet.save();
      return user.save();
    };
    updateDB();
  });
});

router.post("/follow", (req, res) => {
  console.log("following/unfollowing");
  auth.ensureLoggedIn(req, res, () => {
    const updateDB = async () => {
      const viewer = await User.findById(req.user._id);
      if (await User.findById(req.body.profileId)) {
        if (req.body.method === "add") viewer.friends.push(req.body.profileId);
        else viewer.friends = viewer.friends.filter((id) => id !== req.body.profileId);
        viewer.save();
        console.log("Updated following list: ");
        console.log(viewer.friends);
        res.status(200).send({});
      } else {
        res.status(404).send("profile not found");
        return;
      }
    };
    updateDB();
  });
});

router.post("/update-settings", (req, res) => {
  auth.ensureLoggedIn(req, res, () => {
    const updateDB = async () => {
      //allowing client to update another user's setting for now, since DB isn't populated yet
      const id = req.body._id ? req.body._id : req.user._id;
      const user = await User.findById(id);
      user.settings = req.body.settings;
      user.save().then(() => {
        res.status(200).send({});
      });
    };
    updateDB();
  });
});

//I'm not requiring users to be logged in to trigger this post request,
//so that we can handle the google pfps that we don't want
router.post("/profile-picture", (req, res) => {
  const updateDB = async () => {
    const user = await User.findById(req.body.id).catch((err) => {
      res.status(500).send(err);
      return;
    });
    if (!user) {
      res.status(404).send({});
      return;
    }
    user.pictureURL = req.body.url;
    user.save().then((user) => {
      res.status(200).send(user);
    });
  };
  updateDB();
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
