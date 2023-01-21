const DEFAULT_LENGTH = 3.5;
const DEFAULT_HEIGHT = 1.5;
const DEFAULT_SCALE = 100;
const HORIZONTAL_SPACING = 4.5;
const VERTICAL_SPACING = 2;

const getThread = (tree, targetId) => {
  let thread = new Set([targetId]);
  let curr = targetId;
  while (tree[curr].parentId !== "") {
    curr = tree[curr].parentId;
    thread.add(curr);
  }
  return thread;
};
/**
 * Calculates the positioning of all snippets in a tree, given
 * a target snippet whose thread should be vertically aligned.
 *
 * @param {{rootId: String, snippetList: Object}} config
 * @param {String} targetId
 */
const getCoords = (tree, targetId) => {
  console.log("getCoords called");

  const rootId = tree[targetId].rootId;
  //get all snippets in the target thread, extended
  //so that the target thread ends on a leaf
  let thread = getThread(tree, targetId);
  let curr = targetId;
  while (true) {
    if (tree[curr].children.length === 0) break;
    else {
      curr = tree[curr].children[0];
      thread.add(curr);
    }
  }

  console.log("thread: ");
  console.log(thread);

  let threadIndices = []; //ith entry indicates the ``horizontal'' index of ith snippet in its corresponding level
  let levels = [];
  let layer = [{ id: rootId, l: true, r: true }];
  while (layer.length !== 0) {
    levels.push(layer);
    let newLayer = [];
    for (const s of layer) {
      if (thread.has(s.id)) {
        let flag = false;
        for (let i = 0; i < tree[s.id].children.length; i++) {
          const child = tree[s.id].children[i];
          if (thread.has(child)) {
            flag = true;
            threadIndices.push(i);
            newLayer.push({ id: child, l: true, r: true });
          } else {
            newLayer.push({ id: child, l: !flag, r: flag });
          }
        }
      } else {
        for (const child of tree[s.id].children) {
          newLayer.push({ id: child, l: s.l, r: s.r });
        }
      }
    }
    layer = newLayer;
  }
  console.log("levels:");
  console.log(levels);

  console.log("Thread indices: ");
  console.log(threadIndices);

  let numLeaves = {};
  for (let i = levels.length - 1; i >= 0; i--) {
    for (let j = 0; j < levels[i].length; j++) {
      const { id, l, r } = levels[i][j];
      const children = tree[id].children;
      if (children.length === 0) numLeaves[id] = { l: l ? 1 : 0, r: r ? 1 : 0 };
      else
        numLeaves[id] = {
          l: children.reduce((acc, next) => acc + numLeaves[next].l, 0),
          r: children.reduce((acc, next) => acc + numLeaves[next].r, 0),
        };
    }
  }

  console.log("numleaves:");
  console.log(numLeaves);

  let coords = {};
  coords[rootId] = { x: 0, y: 0 };

  //id: parent node
  //dir: either "l" or "r"
  //start: index of the child to be positioned directly underneath the parent
  const computeChildCoords = (id, dir, start) => {
    console.log("computing child coords of id: " + id);
    console.log("coords is currently:");
    console.log(coords);
    const ch = tree[id].children;
    console.log("children:");
    console.log(ch);
    if (ch.length === 0) return;
    const depth = coords[id].y;
    const end = dir === "l" ? -1 : ch.length;
    const step = dir === "l" ? -1 : 1;
    let tot = coords[id].x;
    let i = start;
    while (i !== end) {
      console.log("looking at child " + ch[i]);
      coords[ch[i]] = { x: tot, y: depth + 1 };
      tot += step * numLeaves[ch[i]][dir];
      i += step;
    }
  };

  for (let depth = 0; depth < levels.length; depth++) {
    for (const { id, l, r } of levels[depth]) {
      if (l && r) {
        //if node is in targetThread
        computeChildCoords(id, "l", threadIndices[depth]);
        computeChildCoords(id, "r", threadIndices[depth]);
      } else if (l) computeChildCoords(id, "l", tree[id].children.length - 1);
      else if (r) computeChildCoords(id, "r", 0);
    }
  }

  console.log("returning:");
  const { x, y } = coords[targetId];
  for (const id in coords) {
    coords[id].x -= x;
    coords[id].y -= y;
  }
  console.log(coords);
  return coords;
};

const convertToPosition = (coords, delta) => ({
  x:
    delta.x +
    0.5 * window.innerWidth +
    (HORIZONTAL_SPACING * coords.x - 0.5 * DEFAULT_LENGTH) * DEFAULT_SCALE,
  y:
    delta.y +
    0.5 * window.innerHeight +
    (VERTICAL_SPACING * coords.y - 0.5 * DEFAULT_HEIGHT) * DEFAULT_SCALE,
});

const getDimensions = (scale) => ({
  width: DEFAULT_LENGTH * DEFAULT_SCALE * scale,
  height: DEFAULT_HEIGHT * DEFAULT_SCALE * scale,
});

export { getCoords, getThread, convertToPosition, getDimensions };
