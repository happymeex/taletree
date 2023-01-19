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
const getCoords = (tree, rootId, targetId) => {
  console.log("getCoords called");

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

  console.log("thread:");
  console.log(thread);

  let threadIndices = [0]; //ith entry indicates the ``horizontal'' index of ith snippet in its corresponding level
  let levels = [];
  let layer = [{ id: rootId, l: true, r: true }];
  while (layer.length !== 0) {
    levels.push(layer);
    let newLayer = [];
    if (levels.length >= thread.size) {
      for (const s of layer)
        for (const child of tree[s.id].children) {
          newLayer.push({ id: child, l: s.l, r: s.r });
        }
    } else {
      for (const s of layer) {
        let flag = false;
        for (const child of tree[s.id].children) {
          if (thread.has(child)) {
            threadIndices.push(newLayer.length);
            newLayer.push({ id: child, l: true, r: true });
            flag = true;
          } else newLayer.push({ id: child, l: !flag, r: flag });
        }
      }
    }
    layer = newLayer;
  }

  console.log("levels:");
  console.log(levels);

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

  console.log("numLeaves");
  console.log(numLeaves);

  let coords = {};
  for (let i = 0; i < levels.length; i++) {
    const startIndex = i < thread.size ? threadIndices[i] : 0;
    coords[levels[i][startIndex].id] = { x: 0, y: i };
    for (let j = startIndex - 1; j >= 0; j--) {
      coords[levels[i][j].id] = { x: coords[levels[i][j + 1].id].x - 1, y: i };
    }
    for (let j = startIndex + 1; j < levels[i].length; j++) {
      coords[levels[i][j].id] = { x: coords[levels[i][j - 1].id].x + 1, y: i };
    }
  }
  console.log("returning:");
  console.log(coords);
  return coords;
};

export { getCoords, getThread };
