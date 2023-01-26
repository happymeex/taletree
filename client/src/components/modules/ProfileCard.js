import React, { Component } from "react";
import "./ProfileCard.css"

const ProfileCards = (props) => {
    
    //{
    return (
      <div className="clearfix">
        {props.data.map((person) => (
            <div className="row u-flex-alignCenter u-flex-justifyCenter">
              <div className="card ">
                <div className="container1">
              <div className="avatar leftThing1">
                <img src={person.test_img} className="card-img-top resize center" alt="" />
              </div>
              <h5 className="card-title rightThing1">
                {person.name}
              </h5>
              </div> {/*For container1*/}
              </div> 
              </div>
          ))}
        </div>
      
    );
  //}
}

export default ProfileCards;


  