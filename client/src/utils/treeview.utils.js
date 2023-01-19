/**
 * Calculates the positioning of all snippets in a tree, given
 * a target snippet whose thread should be vertically aligned.
 *
 * @param {{rootId: String, snippetList: Object}} config
 * @param {String} targetId
 */
const getCoords = (config, targetId) => {
  const { rootId, snippetList } = config;

  //get all snippets in the target thread, extended
  //so that the target thread ends on a leaf
  let targetThread = new Set([targetId]);
  let curr = targetId;
  while (curr !== rootId) {
    curr = snippetList[curr].parentId;
    targetThread.add(curr);
  }
  curr = targetId;
  while (true) {
    if (snippetList[curr].children.length === 0) break;
    else {
      curr = snippetList[curr].children[0];
      targetThread.add(curr);
    }
  }

  let targetThreadIndices = [0]; //ith entry indicates the ``horizontal'' index of ith snippet in its corresponding level
  let levels = [];
  let layer = [{ id: rootId, l: true, r: true }];
  while (layer.length !== 0) {
    levels.push(layer);
    let newLayer = [];
    if (levels.length >= targetThread.size) {
      for (const s of layer)
        for (const child of snippetList[s.id].children) {
          newLayer.push({ id: child, l: s.l, r: s.r });
        }
    } else {
      for (const s of layer) {
        let flag = false;
        for (const child of snippetList[s.id].children) {
          if (targetThread.has(child)) {
            targetThreadIndices.push(newLayer.length);
            newLayer.push({ id: child, l: true, r: true });
            flag = true;
          } else newLayer.push({ id: child, l: !flag, r: flag });
        }
      }
    }
    layer = newLayer;
  }

  let numLeaves = {};
  for (let i = levels.length - 1; i >= 0; i--) {
    for (let j = 0; j < levels[i].length; j++) {
      const { id, l, r } = levels[i][j];
      const children = snippetList[id].children;
      if (children.length === 0) numLeaves[id] = { l: l ? 1 : 0, r: r ? 1 : 0 };
      else
        numLeaves[id] = {
          l: children.reduce((acc, next) => acc + numLeaves[next].l, 0),
          r: children.reduce((acc, next) => acc + numLeaves[next].r, 0),
        };
    }
  }

  let coords = {};
  for (let i = 0; i < levels.length; i++) {
    const startIndex = i < targetThread.size ? targetThreadIndices[i] : 0;
    coords[levels[i][startIndex].id] = { x: 0, y: i };
    for (let j = startIndex - 1; j >= 0; j--) {
      coords[levels[i][j].id] = { x: coords[levels[i][j + 1].id].x - 1, y: i };
    }
    for (let j = startIndex + 1; j < levels[i].length; j++) {
      coords[levels[i][j].id] = { x: coords[levels[i][j - 1].id].x + 1, y: i };
    }
  }
  return coords;
};

export { getCoords };
