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
  ROOT,
  ZOOM_SENSITIVITY,
} from "../../utils/treeview.utils";
import TreeViewSnippet from "../modules/TreeViewSnippet";
import GenericButton from "../modules/GenericButton";
import WriteNewSnippet from "../modules/WriteNewSnippet";
import ModalBackground from "../modules/ModalBackground";
import TreeViewMenu from "../modules/TreeViewMenu";
import ThreadReader from "../modules/ThreadReader";
import "./TreeView.css";

const ALLOW_DRAG = (classname) => {
  return (
    classname.startsWith("TreeView-") ||
    classname === "TreeViewSnippet-container" ||
    classname === "NavBar-container"
  );
};
const ALLOW_HIGHLIGHT = (classname) => {
  return (
    classname.startsWith("SingleSnippet-contentBox") ||
    classname.startsWith("SingleSnippet-authorName") ||
    classname === "WriteNewSnippet-textbox"
  );
};

/**
 * Page for viewing a snippet tree.
 * Proptypes
 * @param {String} snippetId
 * @param {Object} viewer
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
  const [writer, setWriter] = useState(false);
  const [reader, setReader] = useState(false);
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
    setLocalViewer((v) => {
      if (action === "add") {
        v[attrib].add(id);
      } else if (action === "delete") {
        v[attrib].delete(id);
      }
      return v;
    });
  };

  const handleMouseDown = (e) => {
    console.log("pos: " + pos.x + " " + pos.y);
    if (!ALLOW_HIGHLIGHT(e.target.className)) e.preventDefault();
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

  const toggleSnippetWriter = () => {
    props.popupHandlers.toggle("writer");
    props.popupHandlers.setWriteHandler((input) => {
      handlePost(input);
    });
  };

  const toggleThreadReader = () => {
    const content = getThread(snippets, target, false)
      .reverse()
      .map((id) => snippets[id].content);
    props.popupHandlers.toggle("reader");
    props.popupHandlers.setContent(content);
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
    setDelta({ x: 0, y: 0 });
    setCoords(newCoords);
    setViewTarget(target);
  };

  const handleWheel = (e) => {
    const scaleRatio = 1 - Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
    console.log("scale ratio: " + scaleRatio);
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
        showAuthor={props.viewer.settings.authorVisible}
        highlight={highlight}
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
                <GenericButton text="Write" onClick={toggleSnippetWriter} />
                <GenericButton text="Align" onClick={alignCurrentThread} />
                <GenericButton text="Read" onClick={toggleThreadReader} />
              </>
            ),
            [snippets, target]
          )}
        </TreeViewMenu>
        <>{snippetList}</>
      </div>
    </>
  );
};

export default TreeView;
