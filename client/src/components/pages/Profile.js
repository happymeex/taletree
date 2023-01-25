import React, { useEffect, useState } from "react";
import { get } from "../../utilities";
import ProfilePersonalInfo from "../modules/ProfilePersonalInfo";
import ProfileContent from "../modules/ProfileContent";

import "./Profile.css";

/**
 * Profile page. NOTE: CURRENTLY MISSING NAVBAR.
 *
 * proptypes
 * @param {String} userId the viewer's id
 * @param {String} profileId the profile's id
 */
const Profile = ({ userId, profileId }) => {
  const [data, setData] = useState(undefined);
  // const [Friends, setFriends] = useState(false);
  const [allFriends, setAllFriends] = useState([]);
  useEffect(() => {
    console.log("viewing profile of user " + profileId);
    const getData = async () => {
      const res = await get("/api/profile", { id: profileId });
      console.log("got data 1:");
      console.log(res);
      setData(res);
      return res;
     
    };
    getData().then( (data) => {
      console.log(data.friends)
      console.log(data.friends[0])


      const getfriends = async () => {
        const responses = new Array();
        if(data.friends && data.friends.length){
          for (const id of data.friends) {
            const res = await get("/api/profile", { id: id });
            console.log("got data 2:");
            responses.push(res)
          };
          // let responses_new = []
          // responses_new = responses.map(friend => ({
          //                                 id: friend._id,
          //                                 name: friend.name,
          //                                 profilePicURL: friend.pictureURL
          //                                 }));
          // console.log(responses_new[0])
          // console.log("first peep")
          // setAllFriends(responses_new)
          // console.log(typeof(responses_new[0]))
          console.log("hehe")

          let listOfProfiles = new Array();
          responses.map(object => {
            let propertyList = [object._id, object.name, object.pictureURL];
            listOfProfiles.push(propertyList);
          });
          console.log(listOfProfiles)
          console.log("sdfgh")
          setAllFriends(listOfProfiles)
  
        }
      };
    getfriends()

    });

  }, [profileId]);

  // let friend_1 = allFriends[0]
  // console.log(friend_1.name)
  // console.log("oihguyk")

  return (
    <>
      {!data ? (
        <div className="Loading">Loading</div>
      ) : (
        <div className="Profile-container">
          <ProfilePersonalInfo
            name={data.name}
            bio={data.bio}
            profilePicURL={data.pictureURL}
            isViewer={userId === profileId}
            allfriends = {allFriends}
          />
          <ProfileContent
            contribs={data.contribs}
            favorites={data.favorites}
            bookmarks={data.bookmarks}
            isViewer={userId === profileId}
          />
        </div>
      )}
    </>
  );
};

// const friendsData = allFriends.map(friend => ({
//   name: friend.name,
//   bio: friend.bio,
//   profilePicURL: friend.pictureURL
// }));

export default Profile;
