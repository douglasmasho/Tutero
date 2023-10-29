import React from 'react';
import {Link} from "react-router-dom";
import Logo from "../assets/blabble.svg";
///uhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuhiuh
///hey wasup, its jesse


const UserThumb = ({otherUser, myUID}) => {
    ///////this is how you will create a new room id
    let roomNameArr = [];
    roomNameArr.push(myUID);
    if(otherUser.type === "tutor"){
        roomNameArr.unshift(`${otherUser.uid}tutero`);
    }else{
        roomNameArr.push(`tutero${otherUser.uid}`)
    }
    const roomName = `${roomNameArr.join("")}`;

    return (
        <>        
            <div style={{display: "flex", justifyContent: "space-evenly", backgroundColor: "white", margin: "10px", boxShadow:"0px 0px 20px 10px rgba(51,51,51,0.1)", padding: "10px", width: "80vw", marginRight: "auto", marginLeft: "auto"}}>
            <p style={{color: "black", backgroundColor: "grey", padding:"10px", margin: "30px"}}>uid: {otherUser.uid}</p>
            <div style={{width: "100px", height: "100px", backgroundColor: "lime", borderRadius: "50%", border: "2px solid black"}}></div>
            <Link to={`/direct/${roomName}`} style={{color: "black", backgroundColor: "#00BFFF", padding:"10px", margin: "30px", borderRadius: "5px", textDecoration: "none"}}>Direct Message</Link>
       </div>
       </>
    )
}

export default UserThumb
