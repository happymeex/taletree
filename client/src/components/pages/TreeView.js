import React from "react";
import { useState, useEffect, useMemo } from "react";
import { get, post } from "../../utilities";
import {
  getCoords,
  getThread,
  convertToPosition,
  getDimensions,
  getIncomingLine,
  getOutgoingLine,
  getScaledDelta,
  getVerticalDelta,
  getDisplacement,
  ROOT,
  ZOOM_SENSITIVITY,
} from "../../utils/treeview.utils";
import { getRandomPlaceholder } from "../../utils/snippet.utils";
import TreeViewSnippet from "../modules/TreeViewSnippet";
import GenericButton from "../modules/GenericButton";
import TreeViewMenu from "../modules/TreeViewMenu";
import "./TreeView.css";

const ALLOW_DRAG = (classname) => {
  return (
    classname.startsWith("TreeView-") ||
    classname === "TreeViewSnippet-container" ||
    classname === "NavBar-container"
  );
};

//DEPRECATED
const ALLOW_HIGHLIGHT = (classname) => {
  return (
    classname.startsWith("SingleSnippet-contentWrapper") ||
    classname.startsWith("SingleSnippet-authorName") ||
    classname === "WriteNewSnippet-textbox"
  );
};

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippetId
 * @param {Object} viewer
 * @param {Function} setViewer
 * @param {Object} goTo navigation functions
 * @param {{toggle: Function, setContentGenerator: Function}} popupHandlers
 */
const TreeView = (props) => {
  const [pos, setPos] = useState({ x: 0, y: 0 }); //mouse position
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrag, setIsDrag] = useState(false);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [coords, setCoords] = useState(undefined);
  const [snippets, setSnippets] = useState(undefined);
  const [target, setTarget] = useState(props.snippetId); //the leaf snippet in the currently highlighted thread
  const [viewTarget, setViewTarget] = useState(props.snippetId); //the snippet assigned coordinates (0,0)
  const [thread, setThread] = useState(undefined);
  const [highlight, setHighlight] = useState(true);
  const [scale, setScale] = useState(1);
  const [localViewer, setLocalViewer] = useState(props.viewer);
  const [authorToPic, setAuthorToPic] = useState(undefined);

  useEffect(() => {
    const getSnippetData = async () => {
      const tree = await get("/api/treeview", { _id: props.snippetId });
      console.log("Tree received from server: ");
      console.log(tree);
      let userIds = [];
      for (const id in tree) userIds.push(tree[id].authorId);
      const atp = await get("/api/profile-pictures", { userIds: userIds });
      setAuthorToPic(atp);
      setCoords(getCoords(tree, props.snippetId));
      setThread(getThread(tree, props.snippetId));
      setSnippets(tree);
    };
    getSnippetData();

    const updatePos = (e) => {
      setPos({ x: e.x, y: e.y });
    };
    window.addEventListener("mousemove", updatePos);
  }, []);

  useEffect(() => {
    if (isDrag) {
      setDelta((d) => {
        d.x += pos.x - startPos.x;
        d.y += pos.y - startPos.y;
        return d;
      });
      setStartPos(pos);
    }
  }, [pos]);

  const updateLocalViewer = (attrib, id, action) => {
    console.log("updating!");
    const update = (v) => {
      if (action === "add") {
        v[attrib].add(id);
      } else if (action === "delete") {
        v[attrib].delete(id);
      }
      return v;
    };
    //setLocalViewer((v) => {
    //  if (action === "add") {
    //    v[attrib].add(id);
    //  } else if (action === "delete") {
    //    v[attrib].delete(id);
    //  }
    //  return v;
    //});
    setLocalViewer((v) => update(v));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (ALLOW_DRAG(e.target.className)) {
      setIsDrag(true);
      setStartPos(pos);
    }
  };

  const handleMouseUp = () => {
    setIsDrag(false);
  };

  const handleSnippetClick = (id) => {
    setTarget(id);
    const newThread = getThread(snippets, id);
    setThread(newThread);
  };

  const toggleSnippetWriter = (toggleReader) => {
    //open reader along with writer
    console.log("snippet writer toggler called, toggleReader: " + toggleReader);
    const placeholder = getRandomPlaceholder("append");
    if (toggleReader) toggleThreadReader();
    props.popupHandlers.toggle("writer");
    props.popupHandlers.setWriteHandler((input) => {
      handlePost(input);
    });
    props.popupHandlers.setWriterPlaceholder(placeholder);
  };

  const toggleThreadReader = () => {
    const text = getThread(snippets, target, false)
      .reverse()
      .map((id) => snippets[id].content);
    const settings = {
      openWriter: () => {
        toggleSnippetWriter(false);
      },
    };
    props.popupHandlers.toggle("reader");
    props.popupHandlers.setContent({ settings: settings, text: text });
  };

  const handlePost = (input) => {
    console.log("posting snippet as " + props.viewer.name + " with input:");
    console.log(input);
    post("/api/new-snippet", {
      authorName: props.viewer.name,
      authorId: props.viewer._id,
      parentId: target,
      input: input,
      treeId: snippets[target].treeId,
    }).then((s) => {
      //returned snippet object
      if (s._id) {
        let tree = structuredClone(snippets);
        tree[s._id] = s;
        tree[s.parentId].children.push(s._id);
        const newCoords = getCoords(tree, viewTarget);
        const newThread = getThread(tree, s._id);
        setCoords(newCoords);
        setSnippets(tree);
        setThread(newThread);
        setTarget(s._id);
        setAuthorToPic((obj) => {
          obj[props.viewer._id] = props.viewer.pictureURL;
          return obj;
        });
      }
    });
  };

  const alignCurrentThread = () => {
    const newCoords = getCoords(snippets, target);
    const newThread = getThread(snippets, target);
    setThread(newThread);
    const newY = getVerticalDelta(coords[target].y, coords[viewTarget].y, scale);
    setDelta((d) => {
      return { x: 0, y: d.y - newY };
    });
    setCoords(newCoords);
    setViewTarget(target);
  };

  const handleWheel = (e) => {
    const scaleRatio = 1 - Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
    setDelta((d) => getScaledDelta(d, pos, scaleRatio));
    setScale((x) => scaleRatio * x);
  };

  let snippetList = [];
  for (const id in snippets) {
    const s = snippets[id];
    const pos = convertToPosition(coords[id], delta, scale);
    const size = getDimensions(scale);
    const line = {
      fromParent:
        s.parentId === ROOT
          ? undefined
          : getIncomingLine(pos, size, coords[id].x - coords[s.parentId].x, scale),
      toChild: s.children.length === 0 ? undefined : getOutgoingLine(pos, size, scale),
    };
    const author = {
      name: s.authorName,
      id: s.authorId,
      pictureURL: authorToPic[s.authorId],
    };
    snippetList.push(
      <TreeViewSnippet
        key={id}
        container={{
          pos: pos,
          size: size,
        }}
        line={line}
        author={author}
        content={s.content}
        _id={s._id}
        viewerId={props.viewer._id}
        settings={{
          authorVisible: props.viewer.settings.authorVisible,
          showSnippetLikes: props.viewer.settings.showSnippetLikes,
        }}
        highlight={highlight}
        numLikes={s.numLikes}
        status={{
          isFavorite: localViewer.favorites.has(id),
          isBookmark: localViewer.bookmarks.has(id),
        }}
        updateLocalViewer={updateLocalViewer}
        isTarget={id === target}
        inTargetThread={thread.has(id)}
        onClick={(e) => {
          if (e.target.className.startsWith("Icon")) return;
          handleSnippetClick(id);
        }}
        scale={scale}
        goTo={props.goTo}
        popupHandlers={props.popupHandlers}
      />
    );
  }

  return (
    <>
      <div
        id="TreeViewContainer"
        className="TreeView-container u-flex-end"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <TreeViewMenu>
          {useMemo(
            () => (
              <>
                <GenericButton text="Read" onClick={toggleThreadReader} />
                <GenericButton
                  text="Write"
                  onClick={() => {
                    toggleSnippetWriter(true);
                  }}
                />
                <GenericButton text="Align" onClick={alignCurrentThread} />
                <GenericButton
                  text="Center"
                  onClick={() => {
                    setDelta(getDisplacement(coords[target], coords[viewTarget], scale));
                  }}
                />
              </>
            ),
            [snippets, target, viewTarget, coords]
          )}
        </TreeViewMenu>
        <>{snippetList}</>
      </div>
    </>
  );
};

export default TreeView;
