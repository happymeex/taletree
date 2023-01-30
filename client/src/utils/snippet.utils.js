const APPEND_SNIPPET_PLACEHOLDERS = [
  "What happened next?",
  "Continue the story!",
  "Weave the threads of this tale.",
  "And then what?",
  "And so the tree grows.",
];

const NEW_SNIPPET_PLACEHOLDERS = [
  "Tell us a story!",
  "Begin a new adventure!",
  "A new tale waiting to be told.",
  "Write that down, write that down!",
  "Do tell, do tell.",
];

const EASTER_EGG = "Made with love. -Meex";

const getRandomPlaceholder = (type) => {
  const placeholders = type === "new" ? NEW_SNIPPET_PLACEHOLDERS : APPEND_SNIPPET_PLACEHOLDERS;
  const index = Math.floor(Math.random() * 10 * placeholders.length);
  if (index === 0) return EASTER_EGG;
  return placeholders[index % placeholders.length];
};

const postFromFeed = (input, viewer, callback) => {
  const writeToDB = async () => {
    const treeId = await post("/api/new-tree");
    console.log("browser got treeId: " + treeId);
    if (treeId)
      post("/api/new-snippet", {
        authorName: viewer.name,
        authorId: viewer._id,
        input: input,
        parentId: ROOT,
        treeId: treeId,
      }).then(callback());
  };
  writeToDB();
};

export { getRandomPlaceholder, postFromFeed };
