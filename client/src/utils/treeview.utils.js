const DEFAULT_LENGTH = 3.7;
const DEFAULT_HEIGHT = 1.8;
const DEFAULT_SCALE = 100;
const HORIZONTAL_SPACING = 4.5;
const DEFAULT_LINE_HEIGHT = 0.7;
const DEFAULT_BORDER = 1; //in pixels
const BORDER_HIGHLIGHT_MULTIPLIER = 5;
const DEFAULT_LINE_WIDTH = 0.01;
const LINE_HIGHLIGHT_MULTIPLIER = 2;
const ZOOM_SENSITIVITY = 0.05;
const DEFAULT_PROFILE_PICTURE_SIZE = 48; //in pixels
const DEFAULT_AUTHOR_NAME_FONT_SIZE = 16;
const DEFAULT_ICON_SIZE = 24; //in pixels
const DEFAULT_CONTENT_FONT_SIZE = 16;

const ROOT = "63d04ff67f9ad37d137f7750";

let rootId = undefined;
const getThread = (tree, targetId, asSet = true) => {
  let thread = [targetId];
  let curr = targetId;
  while (tree[curr].parentId !== ROOT) {
    curr = tree[curr].parentId;
    thread.push(curr);
  }
  rootId = curr;
  return asSet ? new Set(thread) : thread;
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

  let coords = {};
  coords[rootId] = { x: 0, y: 0 };

  //id: parent node
  //dir: either "l" or "r"
  //start: index of the child to be positioned directly underneath the parent
  const computeChildCoords = (id, dir, start) => {
    const ch = tree[id].children;
    if (ch.length === 0) return;
    const depth = coords[id].y;
    const end = dir === "l" ? -1 : ch.length;
    const step = dir === "l" ? -1 : 1;
    let tot = coords[id].x;
    let i = start;
    while (i !== end) {
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

  const { x, y } = coords[targetId];
  for (const id in coords) {
    coords[id].x -= x;
    coords[id].y -= y;
  }
  return coords;
};

const convertToPosition = (coords, delta, scale) => {
  return {
    x:
      delta.x +
      0.5 * window.innerWidth +
      (HORIZONTAL_SPACING * coords.x - 0.5 * DEFAULT_LENGTH) * DEFAULT_SCALE * scale,
    y:
      delta.y +
      0.5 * window.innerHeight +
      ((2 * DEFAULT_LINE_HEIGHT + DEFAULT_HEIGHT) * coords.y - 0.5 * DEFAULT_HEIGHT) *
        DEFAULT_SCALE *
        scale,
  };
};

const getDimensions = (scale) => {
  const trueScale = DEFAULT_SCALE * scale;
  return {
    x: DEFAULT_LENGTH * trueScale,
    y: DEFAULT_HEIGHT * trueScale,
    border: DEFAULT_BORDER * scale,
  };
};

const getOutgoingLine = (pos, size, scale = 1) => {
  return {
    pos: { x: pos.x + 0.5 * size.x, y: pos.y + size.y },
    size: { x: 0, y: DEFAULT_LINE_HEIGHT * DEFAULT_SCALE * scale },
    thickness: DEFAULT_LINE_WIDTH * DEFAULT_SCALE * scale,
  };
};

const getIncomingLine = (pos, size, xdiff, scale = 1) => {
  const trueScale = DEFAULT_SCALE * scale;
  return {
    up: {
      pos: { x: pos.x + 0.5 * size.x, y: pos.y - DEFAULT_LINE_HEIGHT * trueScale },
      size: {
        x: 0,
        y: DEFAULT_LINE_HEIGHT * trueScale,
      },
      thickness: DEFAULT_LINE_WIDTH * trueScale,
    },
    horizontal: {
      pos: {
        x: pos.x + 0.5 * size.x - (xdiff < 0 ? 0 : xdiff * HORIZONTAL_SPACING * trueScale),
        y: pos.y - DEFAULT_LINE_HEIGHT * trueScale,
      },
      size: {
        x: Math.abs(xdiff) * HORIZONTAL_SPACING * trueScale,
        y: 0,
      },
      thickness: DEFAULT_LINE_WIDTH * trueScale,
    },
  };
};

const SIDES = [
  ["borderTop", "borderBottom"],
  ["borderLeft", "borderRight"],
];

const assembleStyle = (obj, highlight, lineOrientation = undefined, scale) => {
  let ret = {
    position: `absolute`,
    left: `${obj.pos.x}px`,
    top: `${obj.pos.y}px`,
    //width: `${obj.size.x}px`,
    //height: `${obj.size.y}px`,
    margin: `0`,
  };
  if (lineOrientation === undefined) {
    ret["transform"] = `scale(${scale})`;
    ret["transformOrigin"] = `top left`;
  } else {
    ret["width"] = `${obj.size.x}px`;
    ret["height"] = `${obj.size.y}px`;
    for (const side of SIDES[lineOrientation])
      ret[side] = `${obj.thickness * (highlight ? LINE_HIGHLIGHT_MULTIPLIER : 1)}px solid`;
  }

  return ret;
};

const getSnippetBorder = (highlight, scale) => {
  return `${DEFAULT_BORDER * scale * (highlight ? BORDER_HIGHLIGHT_MULTIPLIER : 1)}px solid black`;
};

const getScaledDelta = (delta, zoomOrigin, scale) => {
  return {
    x: scale * delta.x + (1 - scale) * (zoomOrigin.x - 0.5 * window.innerWidth),
    y: scale * delta.y + (1 - scale) * (zoomOrigin.y - 0.5 * window.innerHeight),
  };
};

const getVerticalDelta = (y1, y2, scale) => {
  return (y2 - y1) * (2 * DEFAULT_LINE_HEIGHT + DEFAULT_HEIGHT) * DEFAULT_SCALE * scale;
};

export {
  ROOT,
  ZOOM_SENSITIVITY,
  DEFAULT_PROFILE_PICTURE_SIZE,
  DEFAULT_AUTHOR_NAME_FONT_SIZE,
  DEFAULT_ICON_SIZE,
  DEFAULT_CONTENT_FONT_SIZE,
  getCoords,
  getThread,
  convertToPosition,
  getDimensions,
  getOutgoingLine,
  getIncomingLine,
  assembleStyle,
  getScaledDelta,
  getSnippetBorder,
  getVerticalDelta,
};
