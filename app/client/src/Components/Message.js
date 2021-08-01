import React from 'react';
import Trash from "../assets/trash.svg";
import moment from "moment";
import { useEffect } from 'react';


const Message = ({messageObj, currentUID, deleteFunc}) => {
    const date = JSON.parse(messageObj.timestamp);

    const handleDelete = (e)=>{
        const jsonString = e.target.dataset.id;
        const obj = JSON.parse(jsonString)
        deleteFunc(obj);
    }
    

    if(currentUID === messageObj.author){
        //these messages are the ones you sent
        return (
            <div style={{width: "100%", display: "flex", justifyContent: "flex-end"}}>
                <div className="my-message-container my-message-container--mine">
                     <img src={Trash} alt="" className="message__delete" data-id={JSON.stringify(messageObj)} onClick={handleDelete}/>
                    <div className="my-messages">
                        <p className="message__text message__text--mine">{messageObj.msg}</p>
                    </div>
                    <p className="message__date message__date--mine">{moment(date).calendar()}</p>
                    <div className="message__photo message__photo--mine" style={{backgroundImage: `url(${messageObj.authorPic})`}}>
                    </div>
                </div>

            </div>

        )
    }else{
        //these messages are that someone sent

        return (
            <div style={{width: "100%", display: "flex", justifyContent: "flex-start"}}>
                <div className="my-message-container my-message-container--theirs">
                    <div className="recipient-messages">
                        <p className="message__text message__text--theirs">{messageObj.msg}</p>
                    </div>
                    <p className="message__date message__date--theirs">{moment(date).calendar()}</p>
                    <div className="message__photo message__photo--theirs" style={{backgroundImage: `url(${messageObj.authorPic})`}}>
                    </div>
                </div>
            </div>

        )
    }
}

export default Message
