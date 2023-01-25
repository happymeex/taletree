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
//   console.log(allfriends);
//   console.log(typeof(allfriends));
//   console.log(allfriends[0]);
//   console.log(typeof(allfriends[0]));
//   let p1 = allfriends[0];
//   console.log('p1 =')
//   console.log(p1);
//   //console.log(p11]);
//  // for (p in p1){
//  //   console.log(p);
//  // }
  console.log(allfriends)
  console.log("haha")

  
    //     if(data.friends && data.friends.length){
    //       for (const id of data.friends) {
    //         const res = await get("/api/profile", { id: id });
    //         console.log("got data 2:");
    //         responses.push(res)


  useEffect(() => {
    console.log("gettting friend info")
    console.log(allfriends)
    let responses = new Array();
    const getFriendData = async () => {
      
      // console.log(allfriends)
      for( let index in allfriends){
        let profileId = undefined
        profileId = allfriends[index]
        console.log("rtyuiop 1")
        console.log(allfriends[index])
        console.log('profileid=' + profileId)
        const resp = await get("/api/profile", { id: profileId });
        responses.push(resp);
        fsetData(responses)
      }
    };
    getFriendData()

   
    // console.log("dfghjk")
  }, []);

  console.log("fdata=")
  console.log(fdata)


  return (
      <div className="Profile-personalInfoContainer u-flexColumn u-flex-alignCenter u-flex-justifyCenter">
      <img src={profilePicURL} className="Profile-picture" />
      <div className="Profile-name ProfileLeft-separator">{name}</div>
      <div className="Profile-bio ProfileLeft-separator">{bio}</div>
      <div className="Profile-friendsHeader ProfileLeft-separator"> Friends     {allfriends.length}</div>
      <div className="Profile-friends">{fdata.length !== 0 ? fdata[0].name : "Loading..."}</div>
    </div>
  );
};

export default ProfilePersonalInfo;
