import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';

import Video from "./Video";
import Peer from "simple-peer";
import Controls from "./Controls";
import lottie from "lottie-web";
import animLoading from "../animations/loading.json"
import {socketContext} from "../Context/socketContext";
import Icon from "./Icon";
import Middle from './Middle';
import Logo from "../assets/logo.svg";
const worker = new Worker("../worker.js");
var arrayBufferConcat = require('arraybuffer-concat');



const Room = (props) => {
    const roomID = props.routeArgs.match.params.roomID,
          [peers, setPeers] = useState([]),//////////////////////your peer is here
          [mode, setMode] = useState("default"),
          [currentFeature, setCurrentFeature] = useState(""),
        //   [file, SetFileState] = useState(null),
          videoRef = useRef(),
          peersRef = useRef([]),
          socketRef = useRef(),
          controlsRef= useRef(),
          otherVideo = useRef(),
        //   fileInpRef= useRef(),
        //   fileRef = useRef(),
        //   progressRef = useRef(),
          animContainerLoading = useRef(),
          animRefLoading = useRef(),
          videoPausedRef = useRef(),
          audioPausedRef = useRef(),
          downloadBtn = useRef(),
          [hasJoined, setHasJoined] = useState(false),
          [connectionMade, setConnectionMade] = useState(false),
          [otherUsers, setOtherusers] = useState([]),
          logoRef = useRef(),
          videoStream = useRef(),
          screenSharedRef = useRef(false),
          queryNoticeRef = useRef(),
          [screenShared, setScreenShared] = useState(false);
          screenSharedRef.current = screenShared;
        //   fileRef.current = file;


    socketRef.current = useContext(socketContext);


    const pauseTrack = useCallback((track)=>{
        switch(track){
            case "video":
                //pause your video;
                 videoRef.current.pause();
                 socketRef.current.emit("pause video", "");
                break;
            case "audio":
                console.log("this fired")
                //send message to the other peer to mute their audio of you
                socketRef.current.emit("mute audio", "");
                break;
           default: //do nothing
        }
        //this code causes a error, resort to stopping the video and audio manually on the other peer.
        // console.log(stream.getAudioTracks()[0]);
        // peers[0].removeTrack(stream.getAudioTracks()[0], stream);
    },[])


    const resumeTrack= useCallback((track)=>{
        switch(track){
            case "video":
                //resume your video
                videoRef.current.play();
                socketRef.current.emit("resume video", "");
                break; 
            case "audio":
                socketRef.current.emit("unmute audio", "")
                break;
            default: //do nothing   
                 
        }
    },[])

    useEffect(()=>{

        const x = window.matchMedia("(max-width: 900px)");

        //query function 
        let showQueryNotice = (x)=>{
            if(!x.matches){
                console.log("do not show notice");
                queryNoticeRef.current.style.display = "none"
            }else{
                console.log("show notice");
                queryNoticeRef.current.style.display = "block"

            }
        }

       showQueryNotice(x);
        x.addListener(showQueryNotice);




        animRefLoading.current = lottie.loadAnimation({
            container: animContainerLoading.current,
            animationData: animLoading,
            loop: true,
        });
        //init socket
        //get media stream 
        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream=>{
            //put the stream in the ref
            //everything else is done here
            videoStream.current = stream;
            videoRef.current.srcObject = stream;
            //send a request to join the current room.
            socketRef.current.emit("join room", roomID);
              
            socketRef.current.on("room full", data=>{
                console.log(data);
            });

            socketRef.current.on("you joined", otherUsers=>{
                //user has joined a room
                 setHasJoined(true);
                //create a peer for each user
                const peers = [];
                setOtherusers(otherUsers);
                otherUsers.forEach(userID=>{
                    const peer = createPeer(userID, stream);
                    //add to the peersRef;
                    peersRef.current.push({
                        peerID: userID,
                        peer
                    })
                    //add peer to state
                    //push the peer into the peers array
                peers.push(peer);
                });
                setPeers(peers)
            });

            socketRef.current.on("caller sending signal", data=>{
                const {callerID, signal}  = data;
                //create a response peer
                const peer = createRespPeer(callerID, signal, stream);
                peer.signal(signal);
                //add to the peersRef;
                peersRef.current.push({
                    peerID: callerID,
                    peer
                })   
                //add peer to peer state 
                setPeers([peer]);
            })

            socketRef.current.on("recipient returned signal", data=>{
                //find the peer that corresponds with the caller
               const peerObj = peersRef.current.find(obj=>(
                    obj.peerID === data.recipientID
            ))
                const peer = peerObj.peer;
                peer.signal(data.signal);
                //set signal as established 
                setConnectionMade(true);
                //send message to old user to tell them that the connection has established
                socketRef.current.emit("connection established", "");
            })

            socketRef.current.on("connection established", data=>{
                setConnectionMade(true);
            })

            socketRef.current.on("client disconnected", discID=>{
                //find the peer associated with the disconnected client
                const discPeer = peersRef.current.find(obj=> obj.peerID === discID).peer;
                // console.log(discPeer);
                // //remove the peer from the array in state.
                setPeers(peers=> (peers.filter(p=>(p !== discPeer)) ) )
                discPeer.destroy();
                window.location.reload();
            })

            socketRef.current.on("hello world", data=>{
                console.log(data)
            })

            socketRef.current.on("pause video", data=>{
                //pause other video
                otherVideo.current.pausePlayVid("pause");
            })

            socketRef.current.on("resume video", data=>{
                //pause other video
                otherVideo.current.pausePlayVid("resume");
            })

            socketRef.current.on("mute audio", data=>{
                otherVideo.current.pausePlayAud("pause")
            })

            socketRef.current.on("unmute audio", data=>{
                otherVideo.current.pausePlayAud("resume")
            })

        })


    },[]);
    const createPeer = (recipient, stream)=>{
        //create a peer
        const peer = new Peer({initiator: true, trickle: false, stream: stream});
        //when signal is ready, send one
        /////////////listen to events 
        peer.on("signal", signal=>{
            socketRef.current.emit("sending signal", {recipient: recipient, signal: signal})
        });
        // peer.on("data", handleReceivingData);
        return peer;
    }

    const createRespPeer = (callerID, signal, stream)=>{
        //create a non-initiator peer
        const peer = new Peer({initiator:false, trickle:false, stream: stream});
        //set the RespPeer signal to the incoming signal
        // setConnectionMade(true);///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //respond to caller when signal is ready
        peer.on("signal", signal=>{
            socketRef.current.emit("returning signal", {signal: signal, callerID: callerID});
        })
        // peer.on("data", handleReceivingData);
        return peer;
    }

    const initFeatureMode =(feature)=>{
        setMode("feature");
        setCurrentFeature(feature);
    }

    const initDefaultMode = ()=>{
        setMode("default");
        document.querySelector(".active").classList.remove("active")
    }

    const stopShareScreen = useCallback(()=>{
        if(screenSharedRef.current){
            peersRef.current[0].peer.replaceTrack(peersRef.current[0].peer.streams[0].getVideoTracks()[0], videoStream.current.getVideoTracks()[0], peersRef.current[0].peer.streams[0]);
            setScreenShared(false);
            console.log(screenSharedRef);
            videoRef.current.srcObject = videoStream.current;
        }
    },[])

    const shareScreen = useCallback(()=>{
        navigator.mediaDevices.getDisplayMedia().then(stream => {
           const track = stream.getTracks()[0];
           // peersRef.current[0].peer.streams[0].getVideoTracks()[0].stop();
           peersRef.current[0].peer.replaceTrack(peersRef.current[0].peer.streams[0].getVideoTracks()[0], track,peersRef.current[0].peer.streams[0]);
           setScreenShared(true);
           track.onended = stopShareScreen;
           videoRef.current.srcObject = stream;
       });
   } ,[peersRef.current])

    const fullScreen = useCallback(()=>{
        otherVideo.current.fullScreen();
    },[])

    let containerStyle, video2Style, pausedStyle, controlsDisplay;
    switch(mode){
        case "feature":
            containerStyle = {
                width: "15%",
                display: "flex",
                flexDirection: "column"
            };

            video2Style = {
                position: "relative",
                bottom: "unset",
                left: "unset",
                width: "100%",
                borderRadius: 0,
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px"
            };
            pausedStyle = {
                position: "relative",
                left: "unset",
                top: "unset",
            };
            controlsDisplay = {
                display: "none"
            }
        break;
        case "default":

            video2Style = {};
            pausedStyle = {};
            controlsDisplay = {};
            break;
        default: 
        //do nothing     
    }

     //prevent user from using controls if they havent joined
    let icons;
     if(hasJoined){
        icons = <>
                    <Icon feature={"ytShare"}  featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"liveCanvas"} featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"fileShare"}  featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"liveChat"} featureMode={initFeatureMode} logo={logoRef.current}/>
               </>
    }else{
        icons = null
    }

    ///do he same thing for the middle div component
    let middle
    
    if(hasJoined){
        middle =  <Middle currentFeature={currentFeature} defaultMode={initDefaultMode} mode={mode} peers={peers} connectionMade={connectionMade} otherUsers={otherUsers}/>
    }else{
        middle = null
    }

    return ( 
        <div>
            <div className="querynotice" ref={queryNoticeRef}>
                <h3>Please use desktop mode</h3>
            </div>
                <div className="row" style={{justifyContent: "space-between", height: "100%", padding: 0}}>
                    <div className="features--tab">
                        <img src={Logo} alt="logo" className="features--logo" ref={logoRef}/>
                        {icons}
                    </div>
                    {middle}
                    <div className="video-container" style={containerStyle}>
                        <div className="loading" ref={animContainerLoading}>
                        </div>
                            <div className="video-controls center-vert" ref={controlsRef} style={{display: "none"}}>
                                <div style={controlsDisplay}>
                                   <Controls pauseTrack={pauseTrack} resumeTrack={resumeTrack} video={videoRef.current}  fullScreen={fullScreen} screenShared={screenShared} shareScreen={shareScreen} stopShareScreen={stopShareScreen}/>
                                </div>
                            </div>
                            
                            <div  className="video-composition">

                                <div className="video-pauseContainer"  style={pausedStyle}>
                                <p className="video-videoPaused normal-text" ref={videoPausedRef}>Peer paused their video</p>
                                <p className="video-audioPaused normal-text" ref={audioPausedRef}>Peer muted their audio</p>
                                </div>
                                
                                <video muted autoPlay playsInline ref={videoRef} className="video-composition--2" style={video2Style}></video>
                                {
                                    peers.map((peer, index)=>{
                                        return <Video key={index} peer={peer} ref={otherVideo} videoControls={controlsRef.current} loadingRef={animContainerLoading.current} videoPausedRef={videoPausedRef.current} audioPausedRef={audioPausedRef.current}  mode={mode}/>
                                    })
                                }
                            </div>
                    </div>  
                </div>
        </div>

     );
}
 
export default Room;