import React, { useEffect, useState } from "react";
import "../pages/Profile.css";
import { get } from "../../utilities";

/**
 * left (or top) portion of profile page with name, bio, friends, groups
 *
 * @param {String} name
 * @param {String} bio
 * @param {Boolean} isViewer true if this is the viewer's page
 */
const ProfilePersonalInfo = ({profilePicURL, name, bio, isViewer, allfriends}) => {
  const [fdata, fsetData] = useState([]);  
  console.log(allfriends)

  useEffect(() => {
    console.log("gettting friend info")
    console.log(allfriends)

    let responses = new Array();
    const getFriendData = async () => {
      for( const profileId of allfriends){
        console.log('profileid=' + profileId)
        const resp = await get("/api/profile", { id: profileId });
        responses.push(resp)
        fsetData([...fdata, ...responses])
        //fsetData([...fdata, resp])
        
      }
    };
    getFriendData()
    
  }, []);

  console.log("fdata length=")
  console.log(fdata.length)



  return (
      <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{name}</div>
      <div className="Profile-bio ProfileLeft-separator">{bio}</div>
      <div className="Profile-friendsHeader ProfileLeft-separator"> Friends {allfriends.length}</div>
      <div className="Profile-friends">{fdata.length !==0 ? fdata[0].name : "Loading..."}</div>
      <div className="Profile-friends">{fdata.length > 1 ? fdata[1].name : "Loading..."}</div> 

    </div>
  );
};

export default ProfilePersonalInfo;
