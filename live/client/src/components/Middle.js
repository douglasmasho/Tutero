import React, { useEffect, useRef, useState, useContext } from 'react';
import LiveChat from './LiveChat';
import Cross from "../assets/cross.svg";
import FileShare from "./FileShare";
import YtShare from "./YtShare";
import {socketContext} from "../Context/socketContext";
import SimpleBar from 'simplebar-react';
import LiveCanvas from './LiveCanvas';

const Middle = (props) => {
    const fileShareRef = useRef(),
          ytShareRef = useRef(),
          [isytShareOn, setIsytShareOn] = useState(true),
          socketRef = useRef(),
          middleRef = useRef(),
          liveCanvasRef = useRef();

        //   console.log(props.otherUsers);

    socketRef.current = useContext(socketContext);

    const removeCurrentFeature = ()=>{
        if(document.querySelector(".features__visible")){
            document.querySelector(".features__visible").classList.remove("features__visible");
        }
    }

    const startSession = ()=>{
        setIsytShareOn(true);
        //send message to your peer so their ytshre component is rendered
        socketRef.current.emit("startYTSession", "");
    }


    useEffect(()=>{
       socketRef.current.on("startYTSession", data=>{
        setIsytShareOn(true);
       })
    }, [])

    let width, opacity ,content, crossWidth, title, height;
    height = "unset";
    //content will be dependent on the current feature
    let currentComponent;
    switch(props.currentFeature){ ///////////read currentFeature to determine what must be displayed in  the middleDiv
        case "":
                currentComponent = null;
                title = null;
                removeCurrentFeature();
            break;
        case "liveChat":
                currentComponent = <LiveChat middleDiv={middleRef.current}/>;
                title = "Live Chat";
                removeCurrentFeature();
            break;
        case "fileShare":
                title = "File Share";
                //removethe visible class from any currently visible feature
                removeCurrentFeature();
                //add the active class to this feature
                fileShareRef.current.classList.add("features__visible");  
            break;
        case "ytShare":
                 title = "YT Share";
                removeCurrentFeature();
                ytShareRef.current.classList.add("features__visible");  
             break;
         case "liveCanvas":
                title = "Live Canvas";
               removeCurrentFeature();
               liveCanvasRef.current.classList.add("features__visible"); 
               height = "100%"; 
            break;
        default:
                currentComponent = null;
                removeCurrentFeature();   
    }

    switch(props.mode){
        case "default":
            width = 0;
            opacity = 0;
            crossWidth = 0;
            content = null
            break;
        case "feature":
            width = "70%";
            opacity = 1;
            crossWidth = "3rem"
            content = currentComponent
            break;   
        default: 
        ///do nothing     
    }

    let fileShare
    if(props.connectionMade && props.peers.length === 1){
        fileShare = <FileShare peer={props.peers[0]} connectionMade={props.connectionMade}/>
    }else{
        fileShare = <h5 className="middle--notice">You can share files once a peer has connected</h5>
    }

    let ytShare;
    if(props.connectionMade && props.peers.length === 1 && isytShareOn){
        ytShare = <YtShare peer={props.peers[0]} connectionMade={props.connectionMade} setIsytShareOn={setIsytShareOn} />
    }else if(!isytShareOn){
          ytShare = (
              <div>
                 <h4 className="middle--notice">The YTShare session has been stopped by you or your peer</h4>
                 <button onClick={startSession}>Start session</button>
              </div>
          )
    }
    else{
        ytShare = <h4 className="middle--notice">You can sync-watch youtube videos once a peer has connected</h4>
    }
    
    return ( 
        <div style={{width, opacity, height}} className="middle" ref={middleRef}>
            <div className="middle--header">
                    <h3 className={"features--header"}>{title}</h3>
                    
                    <img src={Cross} alt="" style={{width: crossWidth}} className="middle--close" onClick={
                        props.defaultMode
                    }/>
            </div>
            {content}
            <div style={{display: "none", height: "80%"}} ref={fileShareRef}>
               {fileShare}
            </div>

            <div style={{display: "none"}} ref={ytShareRef}>
                {ytShare}
            </div>

            <div style={{display: "none"}} ref={liveCanvasRef}>
                <LiveCanvas/>
            </div>

        </div>
     );
}
 
export default Middle;