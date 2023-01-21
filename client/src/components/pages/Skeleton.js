import React from "react";
import { navigate } from "@reach/router";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import "../../utilities.css";
import "./Skeleton.css";
import { get, post } from "../../utilities";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "614278991840-38k97pg151j5p5vp8is590n9fom48eko.apps.googleusercontent.com";

const Skeleton = ({ userId, userName, handleLogin, handleLogout }) => {
  return (
    <div>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {userId ? (
          <button
            onClick={() => {
              googleLogout();
              handleLogout();
            }}
          >
            Logout
          </button>
        ) : (
          <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
        )}
        <h1>Good luck on your project :)</h1>
        <h2> What you need to change in this skeleton</h2>
        <ul>
          <li>
            Change the Frontend CLIENT_ID (Skeleton.js) to your team's CLIENT_ID (obtain this at
            http://weblab.us/clientid)
          </li>
          <li>Change the Server CLIENT_ID to the same CLIENT_ID (auth.js)</li>
          <li>
            Change the Database SRV (mongoConnectionURL) for Atlas (server.js). You got this in the
            MongoDB setup.
          </li>
          <li>Change the Database Name for MongoDB to whatever you put in the SRV (server.js)</li>
        </ul>
        <h2>How to go from this skeleton to our actual app</h2>
        <a href="https://docs.google.com/document/d/110JdHAn3Wnp3_AyQLkqH2W8h5oby7OVsYIeHYSiUzRs/edit?usp=sharing">
          Check out this getting started guide
        </a>
      </GoogleOAuthProvider>
      <button
        onClick={() => {
          navigate(`/treeview/63c870ed53ecea1d0cbdc569`, {
            state: { userId: userId, userName: userName },
          });
        }}
      >
        Go to TreeView
      </button>
    </div>
  );
};

export default Skeleton;