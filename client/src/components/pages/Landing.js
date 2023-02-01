import React from "react";
import { GOOGLE_CLIENT_ID } from "../../utils/user.utils";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./Landing.css";

const Landing = ({ handleLogin, setLanding }) => {
  return (
    <>
      <div className="BackgroundImage"></div>
      <div className="Landing-container u-flex-justifyCenter u-flex-alignCenter">
        <div className="Landing-content u-flexColumn u-flex-alignCenter">
          <h1 className="Landing-header">TaleTree</h1>
          <div className="Landing-subheader u-textCenter">
            Read and write collaborative stories with branching storylines.
          </div>
          <div className="Landing-actionBox u-flexColumn u-flex-alignCenter">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleLogin}
                onError={(err) => {
                  console.log(err);
                  alert("An error occurred when logging in.");
                }}
              />
            </GoogleOAuthProvider>
            or
            <div
              className="Landing-continue u-clickable u-darken u-textCenter"
              onClick={() => {
                setLanding(false);
              }}
            >
              Continue without signing in
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
