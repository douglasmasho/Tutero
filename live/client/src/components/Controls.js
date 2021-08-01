import React, {useRef, useEffect, useState} from 'react';
import Camcorder from "../assets/camera-video.svg";
import Mic from "../assets/mic.svg";
import lottie from "lottie-web";
import animation from "../animations/toggleAnimated.json";
import screenShare from "../assets/from xd/screenShare.svg";
import RecordRTC from "recordrtc";

const Controls = (props) => {

    const animationContainer = useRef();
    const animationContainer2 = useRef();
    const animRef = useRef();
    const animRef2 = useRef();
    const [vidState, setVidState] = useState("on");
    const [audState, setAudState] = useState("on");
    const recorderRef = useRef();
    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useRef();
    const myMicTrackRef = useRef();
    const mic = useRef();
    isRecordingRef.current = isRecording;

    useEffect(()=>{
        console.log("i rendered")
    })

    useEffect(()=>{
        animRef.current = lottie.loadAnimation({
            container: animationContainer.current,
            animationData: animation,
            loop: false,
        });
        animRef.current.goToAndStop(0, true);

        animRef2.current = lottie.loadAnimation({
            container: animationContainer2.current,
            animationData: animation,
            loop: false,
        });
        animRef2.current.goToAndStop(0, true);
    }, []);

    const startRecording = ()=>{

        navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
            mic.current = stream;
            myMicTrackRef.current = stream.getAudioTracks()[0];
            navigator.mediaDevices.getDisplayMedia({ video: true,
                audio: {
                    autoGainControl: false,
                    echoCancellation: false,
                    googAutoGainControl: false,
                    noiseSuppression: false,
              }
             }).then(async function(stream){
                console.log(stream.getAudioTracks());

                 stream.addTrack(myMicTrackRef.current);

                 console.log(stream.getAudioTracks());
                let recorder = RecordRTC(stream, {
                    type: "video"
                })
    
                const track = stream.getTracks()[0];
    
                recorderRef.current = recorder;
                recorder.startRecording();
                setIsRecording(true);
    
                track.onended = stopRecording;
            })


        })
    }


    const stopRecording = ()=>{
        if(isRecordingRef.current){
            const monthArr = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const date = new Date();
            const timeStamp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            const day = date.getDate();
            const month = monthArr[date.getMonth()];
            const year = date.getFullYear();
            // const fileName = `${day}-${month}-${year}-${timeStamp}.x-matroska;codecs=avc1,opus`;
            const fileName = `${day}-${month}-${year}-${timeStamp}.webm`;
            console.log(fileName);
            setIsRecording(false);
            recorderRef.current.stopRecording(function() {
                let blob = recorderRef.current.getBlob();
                RecordRTC.invokeSaveAsDialog(blob, fileName);
            });
            // console.log(recorderRef.current);
        }
    }



    const getColorVid = ()=>{
        if(vidState === "on"){
            return "#2ffb52"
        }else if(vidState === "off"){
            return "#ff2c2c"
        }
    }
    const getColorAud = ()=>{
        if(audState === "on"){
            return "#2ffb52"
        }else if(audState === "off"){
            return "#ff2c2c"
        }
    }

    
    const blurUnblurVid =(action)=>{
        const video = props.video;
        let className, lastClassName;
        switch(action){
            case "blur":
                className = "video__blurred";
                lastClassName = "video__unblurred" 
                break;
            case "unblur":
                className = "video__unblurred" 
                lastClassName = "video__blurred";
                break;
            default: //do nothing    
        }
        if(video.classList.contains(lastClassName)){
            video.classList.remove(lastClassName);
            video.classList.add(className);
        }else{
            video.classList.add(className);
        }
    }

    let screenShareBtn;
    if(props.screenShared){
        screenShareBtn =  <button className="button normal-text" onClick={props.stopShareScreen}>Stop sharing</button>
    }else{
        screenShareBtn =  <button className="button normal-text" onClick={props.shareScreen} >Share screen</button>

    }

    let screenRecordIcon, divBackground, textColor, divText, recorderFunc;
    if(isRecordingRef.current){
        screenRecordIcon = <ion-icon name="stop"></ion-icon>;
        divBackground = "#ff0000";
        textColor = "#ffffff";
        divText = "Stop";
        recorderFunc = stopRecording;
    }else{
        screenRecordIcon = (<div style={{color: "red"}}>
                              <ion-icon name="ellipse"></ion-icon>
                            </div>)  
        divBackground = "#2ffb52";
        textColor = "#000000";
        divText = "Record";
        recorderFunc = startRecording;
    }

    return(
                <div>
                    <div className="controls controls__1" style={{backgroundColor: getColorVid(), marginRight: 0}}>
                            <span className="controls--icon"><img src={Camcorder} alt="" className="controls__icon" style={{width: "30px"}}/></span>
                            <div className="row controls--expanded center-vert--row">
                            <span className="row-4--child normal-text controls--label">off</span>
                                <div className="toggle" ref={animationContainer} onClick={()=>{
                                        if(vidState === "on"){
                                            animRef.current.playSegments([0,12], true);
                                            setVidState("off");
                                            props.pauseTrack("video");
                                            //show notice (video);
                                            blurUnblurVid("blur")
                                            
                                        }else{
                                            animRef.current.playSegments([12,24], true);
                                            setVidState("on");
                                            props.resumeTrack("video");
                                            //hide notice(video)
                                            blurUnblurVid("unblur")
                                        }   
                                }}></div>
                            <span className="row-4--child normal-text controls--label">on</span>

                            </div>

                    </div>


                    <div className="controls controls__2" style={{backgroundColor: getColorAud(),...props.styleObj}}>
                        <span className="controls--icon"><img src={Mic} alt="" className="controls__icon" style={{width: "30px"}} /></span>
                        <div className="row controls--expanded  center-vert--row">
                            <span className="row-4--child normal-text controls--label">off</span>
                            <div className="toggle " ref={animationContainer2} onClick={()=>{
                                        if(audState === "on"){
                                            animRef2.current.playSegments([0,12], true);
                                            setAudState("off");
                                            props.pauseTrack("audio");
                                            //show notice(audio)

                                        }else{
                                            animRef2.current.playSegments([12,24], true);
                                            setAudState("on");
                                            props.resumeTrack("audio");
                                            //hide notice(audio)
                                        }   
                            }}></div>
                            <span className="row-4--child normal-text controls--label">on</span>

                        </div>
                    </div>

                    <div className="screenshare">
                        <img src={screenShare} alt=""/>
                        <div className="screenshare--expanded center-vert">
                            {screenShareBtn}
                        </div>
                    </div>     

                    <div className="fullscreen" onClick={props.fullScreen}>
                       <ion-icon name="expand-outline"></ion-icon>
                       <div className="fullscreen--expanded"><p className="black-text u-margin-left">Fullscreen</p></div>
                    </div> 

                    <div className="record" onClick={recorderFunc} style={{backgroundColor: divBackground,color: textColor}}>
                            {screenRecordIcon}
                        <div className="record--expanded center-vert"><p className="u-margin-left">{divText}</p></div>
                    </div>

                </div>
         )
}
 
export default React.memo(Controls);