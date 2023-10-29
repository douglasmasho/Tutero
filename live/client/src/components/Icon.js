import React from 'react';
import screenShare from "../assets/from xd/screenShare.svg";
import ytShare from "../assets/from xd/ytShare.svg";
import liveCanvas from "../assets/from xd/liveCanvas.svg";
import fileShare from "../assets/from xd/clip.svg";
import liveChat from "../assets/from xd/liveChat.svg";

const Icon = (props) => {
    const feature = props.feature;
    const logo = props.logo
    let src;
    switch(feature){
        case "screenShare":
            src = screenShare;
            break;
        case "ytShare":
            src = ytShare;
            break;
        case "liveCanvas":
            src = liveCanvas;
            break;
        case "fileShare":
            src = fileShare;
            break;
        case "liveChat":
            src = liveChat; 
            break;
            default:
                ///wont execute.                
    }

    const showLogo = ()=>{
        logo.style.opacity = 1;
        logo.style.width = "12rem";
    }

    const closeLogo = ()=>{
        logo.style.opacity = 0;
        logo.style.width = 0;
    }
    //const callBack = props.callBack;
    return ( 
        <div className="features--icon" onClick={(e)=>{
            props.featureMode(feature);
            //remove active from the active element
            const current = document.querySelector(".active");
            if(current){
                current.classList.remove("active")
            }
            e.currentTarget.classList.add("active");

        }} onMouseOver={showLogo} onMouseOut={closeLogo}>
            <img src={src} alt=""/>
            <p>{feature}</p>
        </div>
     );
}
 
export default Icon;
