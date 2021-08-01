import React, {useRef, useEffect, useState, useContext} from 'react';
import Plus from "../assets/from xd/plus.svg";
import  {socketContext} from "../Context/socketContext";
require("dotenv").config();

const YtShare = (props) => {
    const ytPlayer = useRef(),
           peer = props.peer,
           secondsInput = useRef(),
           minutesInput = useRef(),
           playlistInput = useRef(),
           videoInput = useRef(),
           positionInput = useRef(),
           plErrorRef = useRef(),
           vErrorRef = useRef(),

           loadPlayerbtn = useRef(),
           modalRef = useRef(),
           addBtn = useRef(),
           overlayRef = useRef(),
           ytControlsRef = useRef(),
           playBtnRef = useRef(),
           [myIframeReady, setmyIframeReady] = useState(false),
           [peerIframeReady, setPeerIframeReady] = useState(false),
        //    [isLoading, setIsloading] = useState(false);
           pauseBtnRef = useRef(),
           playerRef = useRef(),
           socket = useContext(socketContext),
           bottomDiv = useRef();


    useEffect(()=>{
        console.log(process.env)
        const tag = document.createElement("script"); ///create a new script tag
        tag.src = "https://www.youtube.com/iframe_api";
        //find the first script tag
        const firstScript = document.getElementsByTagName("script")[0];
        //place the ytScript on top of the first script tag
        firstScript.parentNode.insertBefore(tag,firstScript)
        //assign a callback function when the api is ready
        window.onYouTubeIframeAPIReady = loadYTVideoPlayer;
         
        
        //set up listeners for incoming data only if the api is ready
        peer.on("data", handleIncomingData);

        document.querySelectorAll(".ytControl").forEach(control=>{
            control.addEventListener("click", controlVid)
        });

        const callBack = (mutationList)=>{
            // console.log(mutationList[0]);
            if(mutationList[0].type === "childList"){
                setmyIframeReady(true);
            }
        }
       const mutationObs = new MutationObserver(callBack);

       const config = {
           attributes: true,
           childList: true,
           subtree: true
       }

       mutationObs.observe(playerRef.current, config);

       //listen to peerIframeReady message
       socket.on("peerIframeReady", data=>{
        setPeerIframeReady(true);
       })

       socket.on("playlist resp", data=>{
           console.log(data);
                           //loop through items and retreive each item.snippet.resourceId.videoId
                let videosArr = []; 
                data.items.forEach(item=>{
                    videosArr.push(item.snippet.resourceId.videoId)
                })
                const videosString = videosArr.join(",");
                //send instruction to the peer
                 peer.send(JSON.stringify({type: "playlist", string: videosString}));
                //load playlist with this string
                ytPlayer.current.loadPlaylist(videosString, 0,0);

       })

       return ()=>{
           socket.off("peerIframeReady")
       }
    }, [])
    

    useEffect(()=>{
        if(myIframeReady){
            loadPlayerbtn.current.style.display = "none";
            //send message to peer to tell them that your iframe is ready
            socket.emit("myIframeReady","")
        }else{
            loadPlayerbtn.current.style.display = "block";
        }
    }, [myIframeReady])

    useEffect(()=>{
        //make sure control only show up when you and your peers Iframes have loaded
        if(myIframeReady && peerIframeReady){
            bottomDiv.current.style.display = "block";
            addBtn.current.style.display = "block";
            ytControlsRef.current.style.display = "flex";
        }else{
            bottomDiv.current.style.display = "none";
            addBtn.current.style.display = "none";
            ytControlsRef.current.style.display = "none";
        }
    }, [myIframeReady, peerIframeReady])

    const closeModal = ()=>{
        modalRef.current.classList.remove("active");
        overlayRef.current.classList.remove("active");   
    }

    const openModal = ()=>{ 
        modalRef.current.classList.add("active");
        overlayRef.current.classList.add("active");   
    }


    const handleIncomingData = (data)=>{
        console.log(data, "loooloo");
        
            const obj = JSON.parse(data);

            switch(obj.type){
                case "play":
                    ytPlayer.current.playVideo();
                    if(document.querySelector(".activePP")){
                        document.querySelector(".activePP").classList.remove("activePP")
                    }
                    playBtnRef.current.classList.add("activePP");
                    break;
                case "pause":
                    ytPlayer.current.pauseVideo();
                    if(document.querySelector(".activePP")){
                        document.querySelector(".activePP").classList.remove("activePP")
                    }
                    pauseBtnRef.current.classList.add("activePP");
                    break;
                case "video":
                    ytPlayer.current.loadVideoById(obj.data);  
                    ytPlayer.current.playVideo();
                    addActive("pp", playBtnRef.current);
                    break;
                case "goTo":
                    ytPlayer.current.seekTo(obj.time, true);
                    break;
                case "playlist":
                    ytPlayer.current.loadPlaylist(obj.string);
                    ytPlayer.current.playVideo();
                    addActive("pp", playBtnRef.current);
                    break;
                case "next":
                     ytPlayer.current.nextVideo();  
                    break; 
                case "previous":
                     ytPlayer.current.previousVideo();
                     break;
                case "stopSession":
                    props.setIsytShareOn(false);
                    break;     
                case "position":
                    ytPlayer.current.playVideoAt(obj.index);  
                    break;
                default: ///do nothing
            }

    }

    const loadYTVideoPlayer = ()=>{
        loadPlayerbtn.current.style.display = "none";
        //create a new player object
        const player = new window.YT.Player("player", { //first arg ==> id of the div you want ot containt the video
           ///second arg: options which include dimensions
            height: "390",
            width: "640",
            controls: false
        });
        //reference the ytPlayer for future use
        ytPlayer.current = player;
    }

    const stopVideo = ()=>{    
        //call the peer to pause their video
        peer.send(JSON.stringify({type: "pause"}));
        //pause the video
        ytPlayer.current.pauseVideo();
    }

    const playVideo = ()=>{    
        //call the peer to play their video
        peer.send(JSON.stringify({type: "play"}))
        //play the video
        ytPlayer.current.playVideo();
    }

    const loadVideo = (e)=>{
        e.preventDefault();
        const videoLink = videoInput.current.value;

        function loadVid(videoID){
           peer.send(JSON.stringify({type: "video", data: videoID}));
            //load the video on the ytPlayer object with the current videoLink
            ytPlayer.current.loadVideoById(videoID); 
        }

        let videoID, index;
        if(videoLink.includes("youtube.com")){
            vErrorRef.current.style.display = "none";
            if(videoLink.includes("/v/")){
                // videoID = videoLink.split("/")[4].slice(0,11);
                index = videoLink.split("/").indexOf("v");
                videoID = videoLink.split("/")[index + 1].slice(0,11)
                loadVid(videoID);
            }else if(videoLink.includes("/embed/")){
                index = videoLink.split("/").indexOf("embed");
                videoID = videoLink.split("/")[index + 1].slice(0,11)
                loadVid(videoID);
            }else{
                videoID = videoLink.split("=")[1].slice(0,11);
                loadVid(videoID);
            }
        }else if(videoLink.includes("youtu.be")){
            vErrorRef.current.style.display = "none";
            index = videoLink.split("/").indexOf("youtu.be");
            videoID = videoLink.split("/")[index + 1].slice(0,11)
            loadVid(videoID);
        }else{
            vErrorRef.current.style.display = "block";
            setTimeout(()=>{
                vErrorRef.current.style.display = "none";
            },2000)
        }

        //close the modal
        closeModal();
        //make the play button active
        addActive("pp", playBtnRef.current);
    }

    const goToTime = (event)=>{
        event.preventDefault();
       const seconds = parseInt(secondsInput.current.value);
       const minutes = parseInt(minutesInput.current.value);
       const minutesToSeconds = minutes * 60;
       const timeStamp = seconds + minutesToSeconds;
       //send instructions to peer
       peer.send(JSON.stringify({type: "goTo", time: timeStamp}))
       //move to the time
       ytPlayer.current.seekTo(timeStamp, true);
    }

    const loadPlaylist = (event)=>{
        event.preventDefault();
        const playlistLink = playlistInput.current.value;
        // ytPlayer.current.loadPlaylist(playlistLink, 0,0);
        //create a link array
        const linkArr = playlistLink.split("=");
        //get the element in th elink that resembles a playlistID
        const playlistID = linkArr.find(str=> str.startsWith("PL"));
        //fetch 
        if(playlistID){
            plErrorRef.current.style.display = "none"
            socket.emit("Fetch playlist", playlistID);    
        }else{
            plErrorRef.current.style.display = "block";
            setTimeout(()=>{
                plErrorRef.current.style.display = "none";
            },2000)
        }

        
        //close the modal
        closeModal();
        //make the play button active
        addActive("pp", playBtnRef.current);
    }

    //playlist controls
    const nextVideo = ()=>{
        peer.send(JSON.stringify({type: "next"}))
        ytPlayer.current.nextVideo();
    }

    const previousVideo = ()=>{
        peer.send(JSON.stringify({type: "previous"}))
        ytPlayer.current.previousVideo();
    }

    const getVideo = ()=>{
        const url = ytPlayer.current.getVideoUrl();
        alert(url)//instead of an alert, open a modal with an anchor tag of the link
    }

    const goToPlaylistVideo = (event)=>{
        event.preventDefault();
        const index = parseInt(positionInput.current.value) - 1;
        console.log(index);
        peer.send(JSON.stringify({type: "position", index}))
        ytPlayer.current.playVideoAt(index);
    }

    const muteVideo = ()=>{
        ytPlayer.current.mute();
    }

    const unMuteVideo = ()=>{
        ytPlayer.current.unMute();
    } 

    const stopSession = ()=>{
        props.setIsytShareOn(false);
        //send message to peer so they can also stop their session
        peer.send(JSON.stringify({type: "stopSession"}))
    }


    const controlVid = (event)=>{
        switch(event.currentTarget.dataset.function){
            case "play":
                playVideo();
                addActive("pp", event.currentTarget)
                break;
            case "pause":
                stopVideo();
                addActive("pp", event.currentTarget)
                break;
            case "unmute":
                //unmute the vid;
                unMuteVideo();
                addActive("mu", event.currentTarget)
                break;
            case "mute":
                //mute the vid
                muteVideo();
                addActive("mu", event.currentTarget)
                break;
            case "prev":
                previousVideo();
                break;
            case "next":
                nextVideo();
                break;
            case "link":
                getVideo();
                break;
            default: //do nothing           
        }

        // event.currentTarget.classList.add("activeControl");
        // console.log(event.currentTarget)
    }

    const addActive = (type, element)=>{
        //to add active classes to the control depending on the type
        switch(type){
            case "pp":
                if(document.querySelector(".activePP")){
                    document.querySelector(".activePP").classList.remove("activePP")
                }
                element.classList.add("activePP");
                break;
            case "mu":    
                if(document.querySelector(".activeMU")){
                    document.querySelector(".activeMU").classList.remove("activeMU");
                }
                element.classList.add("activeMU");
        }
    }

    const sendDummy = ()=>{
        peer.send("string")
    }

    return ( 
        <div>  
            <button onClick={sendDummy}>Dummy data</button>
           <div className="center-hrz u-margin-top u-margin-bottom" style={{position: "relative"}}>
               <div>
                    <div id="ytVideo" ref={playerRef}>
                        <div id="player" />
                    </div>

                    <div className="row" ref={ytControlsRef} style={{justifyContent: "space-evenly"}}>
                        {/* <div className="ytControl" data-function="play" ref={playBtnRef}><img src={Play} alt="" className="ytControl--icon"/></div>
                         */}
                        
                        <div className="ytControl" data-function="play" ref={playBtnRef}><ion-icon name="play-outline" className=" ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="pause" ref={pauseBtnRef}><ion-icon name="pause-outline" className="ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="unmute"><ion-icon name="volume-high-outline" className="ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="mute"><ion-icon name="volume-mute-outline" className="ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="prev"><ion-icon name="play-skip-back-outline" className="ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="next"><ion-icon name="play-skip-forward-outline" className="ytControl--icon"></ion-icon></div>
                        <div className="ytControl"  data-function="link"><ion-icon name="link-outline" className="ytControl--icon"></ion-icon></div>
                    </div>
               </div>

              <button onClick={loadYTVideoPlayer} ref={loadPlayerbtn} style={{display: "none"}}>Show yt player</button>
              <button className="button__add" onClick={openModal} ref={addBtn}><img src={Plus} alt=""/></button>
           </div>

           <div className="modal " ref={modalRef}> 
               <button className="close-button" onClick={closeModal}>&times;</button>
               <form onSubmit={loadVideo} className="form" style={{marginBottom: "4.5rem"}}>
                   <h4 className="form--header">Load a video</h4>
                    <div className="center-hrz--col">
                            <input type="text" placeholder="video link" ref={videoInput} className="input--text u-margin-bottom-small" required/>
                            <p className="bigger-text u-margin-bottom-small" style={{color: "white", display: "none", fontWeight: "lighter" }} ref={vErrorRef}>That is not a valid video link</p>
                            <button className="button normal-text" type="submit">Load Video</button>
                    </div>
               </form>
                <form onSubmit={loadPlaylist} className="form" style={{marginBottom: "4.5rem"}}>  
                    <h4 className="form--header">Load a playlist</h4>
                    <div className="center-hrz--col">
                        <input type="text" placeholder="playlist link" ref={playlistInput} className="input--text u-margin-bottom-small" required/>
                        <p className="bigger-text u-margin-bottom-small" style={{color: "white", display: "none", fontWeight: "lighter" }} ref={plErrorRef}>That is not a valid playlist link</p> 
                        <button className="button normal-text" type="submit">Load playlist</button>
                    </div>  
                </form>
           </div>
           <div className="overlay" ref={overlayRef}></div>

           <div ref={bottomDiv}>
                   <form onSubmit={goToTime} className="u-margin-bottom-medium">
                   <p className="bigger-text u-margin-bottom-small white-text" style={{textAlign: "center"}}>Go to Video timestamp</p>
                       <div className="center-hrz">
                            <input type="number" className="input--number" required placeholder="minutes" ref={minutesInput} min="0"/>
                            <input type="number" className="input--number" required placeholder="seconds" ref={secondsInput} max="59" min="0"/>
                            <button type="submit" className="button normal-text">Go</button>
                       </div>
                    </form>

                    <form onSubmit={goToPlaylistVideo} className="u-margin-bottom-medium">
                        <p className="bigger-text u-margin-bottom-small white-text" style={{textAlign: "center"}}>Play video at playlist position</p>
                        <div className="center-hrz">
                            <input className="input--number" type="number" placeholder="position" ref={positionInput}/>
                            <button type="submit" className="button normal-text">Go</button>
                        </div>
                    </form>

                     <div className="center-hrz u-margin-bottom">
                       <button className="button normal-text" onClick={stopSession}>Stop session</button> 
                     </div>
           </div>


        </div>
     );
}
 
export default YtShare;