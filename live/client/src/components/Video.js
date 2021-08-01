import React, {Component, PureComponent} from 'react';


class Video extends PureComponent {

    peer = this.props.peer;
    video = React.createRef();
    styleObj = React.createRef();

    componentDidMount(){
        this.peer.on("stream", stream=>{
            this.video.current.srcObject = stream;
            this.props.videoControls.style.display = "flex";
            this.props.loadingRef.style.display = "none";
        })

        console.log("I MOUNTED")
    }

    fullScreen(){
        this.video.current.requestFullscreen().catch(e=>{
            console.log(e);
        })
    }
    
    pausePlayVid(action){
        const video = this.video.current;
        switch(action){
            case "pause":
                video.pause();
                //show notice(video)
                this.showHideNotice("video", "show");
                //blur the video
                this.blurUnblurVid("blur");
                break;
            case "resume":
                video.play();
                this.showHideNotice("video", "hide");
                // console.log("yefutdutd");
                // unblur the video
                this.blurUnblurVid("unblur");
                break;
            default: //do nothing    
        }
    }
    pausePlayAud(action){
        const video = this.video.current;
        switch(action){
            case "pause":
                video.muted = true;
                console.log(video.muted);
                this.showHideNotice("audio", "show");    
                break;
            case "resume":
                // video.muted = false;   
                console.log("unnnnmmmuutteed")
                // console.log("unnnnnnmuttttted");
                this.showHideNotice("audio", "hide");
                video.muted = false  
                break;
            default: //do nothing;

        }
    }

    blurUnblurVid(action){
        const video = this.video.current;
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
            default: //do nothing;
        }

        if(video.classList.contains(lastClassName)){
            video.classList.remove(lastClassName);
            video.classList.add(className);
        }else{
            video.classList.add(className);
        }
    }

    showHideNotice(track, action){
        const videoNotice = this.props.videoPausedRef;
        const audioNotice = this.props.audioPausedRef;
        let className;
        let lastClassName;
        switch(action){
            case "show":
                className = "notice__visible";
                lastClassName= "notice__invisible";
                break;
            case "hide":
                className = "notice__invisible";
                lastClassName = "notice__visible";
                // console.log("hdden")
                break;
            default: //do nothing;

        }
        console.log(className, lastClassName);
        switch(track){
            case "video":
                if(videoNotice.classList.contains(lastClassName)){
                    videoNotice.classList.remove(lastClassName);
                    videoNotice.classList.add(className);
                    console.log(className, lastClassName)
                }else{
                    videoNotice.classList.add(className);
                    console.log(videoNotice.classList.contains(lastClassName), lastClassName)
  
                }
                break;
            case "audio":
                if(audioNotice.classList.contains(lastClassName)){
                    audioNotice.classList.remove(lastClassName);
                    audioNotice.classList.add(className);
                    console.log("this is supposed to fire");
                }else{
                    audioNotice.classList.add(className);    
                    console.log(className, lastClassName);
                }
                break;
            default: //do nothing       
        }
    }





    render() { 
        if(this.props.mode === "feature"){
            this.styleObj.current = {
                width: "100%",
                height: "unset",
                position: "relative",
                borderRadius: 0,
                borderBottomLeftRadius: "20px",
                borderBottomRightRadius: "20px"
            }
        }else if(this.props.mode === "default"){
            this.styleObj.current = {}
        }
        return ( 
            <video style={this.styleObj.current} className="video-composition--1" ref={this.video} playsInline autoPlay></video>
         );
    }
}
 
export default Video;
