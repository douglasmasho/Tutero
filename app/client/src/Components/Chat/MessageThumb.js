import React, {useEffect, useState} from 'react';
import firebase from 'firebase/app';
import moment from "moment";
import RandomUser from "../../assets/randomuser.png";
import {Link} from "react-router-dom";



const MessageThumb = (props) => {
    const [latest, setLatest] = useState("");
    const [latestTimeState, setLatestTimeState] = useState("");
    const image = "https://randomuser.me/api/portraits/women/39.jpg";

    useEffect(()=>{
        //fetch latest message

        const firestore = firebase.firestore();

        async function fetchMessages(){
            try{
                const messagesSnapshot = await firestore.collection("messages").doc(props.convoObj.convoID).get();
                const messageArr = messagesSnapshot.data().messagesArr;
                const latestMessage = messageArr[messageArr.length - 1].msg;  
                const latestTime = messageArr[messageArr.length - 1].timestamp;  
                setLatest(latestMessage);
                setLatestTimeState(JSON.parse(latestTime));
            }catch(e){
                console.log(e)
            }
        }

        fetchMessages();
    },[])


    
    return (
        <div className="messageThumb u-margin-bottom">
           
            <div style={{backgroundImage: `url(${props.convoObj.photoURL})`}} className="messageThumb__image">
            </div>
            <div>
                <p className="messageThumb__name">{props.convoObj.name}</p>
                <p className="messageThumb__message">{latest}</p>
                <p className="messageThumb__time">{moment(latestTimeState).calendar()}</p>
            </div>
            <div>
                <Link to={`/direct/${props.convoObj.convoID}`}><button className="buttonn">DM</button></Link>
            </div>
        </div>
    )
}

export default MessageThumb
