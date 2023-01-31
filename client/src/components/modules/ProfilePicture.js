import React, { useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";
import { post } from "../../utilities";
import "./ProfilePicture.css";

const ProfilePicture = ({ id, pictureURL, editable, setAuthorToPic }) => {
  const [url, setUrl] = useState(pictureURL);
  const [loading, setLoading] = useState(false);

  console.log("reredering big profile picture with url " + pictureURL + " url is");
  useEffect(() => {
    setUrl(pictureURL);
  }, [pictureURL]);

  const saveToDB = (formData) => {
    fetch("https://api.imgur.com/3/image/", {
      method: "post",
      headers: {
        Authorization: "Client-ID ad8c12362042a1b",
      },
      body: formData,
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.success) {
          console.log("success!");
          console.log(data.data);
          setUrl(data.data.link);
          setLoading(false);
          post("/api/profile-picture", { id: id, url: data.data.link });
          setAuthorToPic((dict) => {
            let newDict = structuredClone(dict);
            newDict[id] = data.data.link;
            return newDict;
          });
        } else {
          alert("An unexpected error occurred!");
          setLoading(false);
        }
      });
  };

  const handleUpload = (e) => {
    console.log("upload handler called");
    setLoading(true);

    if (!["image/jpeg", "image/png"].includes(e.target.files[0].type)) {
      alert("Please upload either a JPEG file or a PNG file!");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    const callback = (uri) => {
      console.log(uri);
      formData.append("image", uri);
      saveToDB(formData);
    };
    Resizer.imageFileResizer(e.target.files[0], 500, 500, "JPEG", 100, 0, callback, "blob");
  };

  return (
    <div className="ProfilePicture-wrapper u-flex-justifyCenter u-flex-alignItems">
      <img
        className={"ProfilePicture" + (editable ? " ProfilePicture-editable" : "")}
        src={url}
      ></img>
      {editable && (
        <>
          <input
            className="ProfilePicture-inputButton"
            id="uploadPhoto"
            type="file"
            onChange={handleUpload}
          ></input>
          {loading && <div className="Loading ProfilePicture-loading"></div>}
          <label
            htmlFor="uploadPhoto"
            className="ProfilePicture-inputLabel u-flex-justifyCenter u-flex-alignCenter"
          >
            Edit
          </label>
        </>
      )}
    </div>
  );
};

export default ProfilePicture;
