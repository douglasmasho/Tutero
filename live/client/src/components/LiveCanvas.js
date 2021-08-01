import 'rc-color-picker/assets/index.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import  {socketContext} from "../Context/socketContext";
import Pencil from"../assets//from xd/pencil.svg";
import Eraser from"../assets//from xd/Group 117.svg";
import Trash from"../assets//trash.svg";
import Customize from "../assets/customize.svg";
import Download from "../assets/download.svg";
import ColorPicker from 'rc-color-picker';




const LiveCanvas = (props) => {
    const socket = useContext(socketContext),
    canvasRef = useRef(),
    ctx = useRef(),
    scrollFromPeer = useRef(),
    containerRef = useRef(),   
    toolRef = useRef(),
    [customColor, setCustomColor] = useState(),
    // [isPeerDrawing, setIsPeerDrawing] = useState(false),
    // [amIDrawing, setAmIDrawing] = useState(false),
    colorRef = useRef(),
    customEl = useRef(),
    paintingRef = useRef(),
    lcControls = useRef(),
    openTools = useRef(),
    customizeBtn = useRef(),
    customColorRef = useRef(),
    isPeerDrawingRef = useRef(),
    amIDrawingRef = useRef();
    scrollFromPeer.current = false;
    toolRef.current = "draw";
    paintingRef.current = false;
    colorRef.current = "black";
    customColorRef.current = customColor;
    amIDrawingRef.current = false;
    isPeerDrawingRef.current = false;

    useEffect(()=>{
        ctx.current = canvasRef.current.getContext("2d");
        canvasRef.current.width = 3000;
        canvasRef.current.height = 2000;

        document.querySelectorAll(".colors").forEach(el=>{
            el.addEventListener("click", (e)=>{
                colorRef.current = e.currentTarget.style.backgroundColor;
                console.log(colorRef.current);
                if(document.querySelector(".colors-active")){
                    document.querySelector(".colors-active").classList.remove("colors-active") 
                }
                el.classList.add("colors-active")
            })
        })

        ////socket events ///////////////////////////////////////////////
        socket.on("draw", data=>{
            // console.log("peers is drawing");
            const {x,y,type, color} = data;
            // console.log(x,y,type,color);
            switch(type){
                case "start":startPosition(x,y,color);
                    isPeerDrawingRef.current = true;                         
                break;
                case "stop": finishedPosition();
                isPeerDrawingRef.current = false;                                                 

                break;
                case "draw": draw(x,y);
            }
        })

        socket.on("erase", ()=>{
            // setTool("erase")
            // toolRef.current = "erase";
            // console.log("peer is erasing");
            addActiveClass(document.getElementById("erase"));
            // console.log(document.getElementById("erase"));
            customizeBtn.current.classList.add("colors-gone");
            document.querySelectorAll(".colors").forEach(el=>{
                if(el.classList.contains("colors-visible")){
                    el.classList.remove("colors-visible");
                }
                el.classList.add("colors-gone");
            })
            toolRef.current = "erase";
        })

        socket.on("unerase", ()=>{
            addActiveClass(document.getElementById("draw"));
            // console.log(document.getElementById("draw"));
            if(customizeBtn.current.classList.contains("colors-gone")){
                customizeBtn.current.classList.remove("colors-gone")
            }
            document.querySelectorAll(".colors").forEach(el=>{
                if(el.classList.contains("colors-gone")){
                    el.classList.remove("colors-gone");
                }
                el.classList.add("colors-visible");
            })
            toolRef.current = "draw";
        }) 

        socket.on("clear", ()=>{
            ctx.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        })

        socket.on("scroll", data=>{
            const {x,y} = data;
            scrollFromPeer.current = true;
            containerRef.current.scrollTo(x,y);
            console.log(x,y)
        })

    },[])

    useEffect(()=>{
        console.log("LC rerendered");
        // console.log(document.querySelector(".liveCanvas--container").getBoundingClientRect());

    })

    const changeTool = (string)=>{
        toolRef.current = string;
        if(toolRef.current === "erase"){
            socket.emit("erase")
        }else{
            socket.emit("unerase")
        }
    }

    const clear = ()=>{
        ctx.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        socket.emit("clear");
    }

    const startPosition =(x,y,peerColor)=>{
        console.log(toolRef.current, "is used")
        ctx.current.lineCap = 'round';
        ctx.current.moveTo(x, y);
        ctx.current.beginPath();
        // setPainting(true);
        paintingRef.current = true;
        switch(toolRef.current){
            case "erase":
                ctx.current.lineWidth = 20;
                ctx.current.globalCompositeOperation = 'destination-out';
             break;
             case "draw":
                ctx.current.globalCompositeOperation = 'source-over';
                if(peerColor){
                    ctx.current.strokeStyle = peerColor;
                }else{
                    ctx.current.strokeStyle = colorRef.current;
                }
                draw(x,y);
                ctx.current.lineWidth = 3;
             break;
             default: //do nothing   

        }
    }

    const finishedPosition = ()=>{
        // setPainting(false);
        paintingRef.current = false;
    }

    const draw = (x,y)=>{
        if(!paintingRef.current) return;
       //  if(erase){
       //  }
        ctx.current.lineTo(x, y);
        ctx.current.lineCap = "round";
        ctx.current.stroke()
   }

   const drawFunc = (e)=>{
    // console.log(e);

    const x = e.clientX - document.querySelector("#canvas").getBoundingClientRect().x;
    const y = e.clientY - document.querySelector("#canvas").getBoundingClientRect().y;
    let type;
    switch(e.type){
        case "mousedown": type = "start";
                        amIDrawingRef.current = true;
         break;
        case "mouseup": type ="stop";
                        amIDrawingRef.current = false;
        break;
        case "mousemove": type="draw";
        default: //
    }

    if(paintingRef.current || type === "start") /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.emit("draw", {x,y,type,color: colorRef.current});
    
    switch(type){
        case "start": startPosition(x,y,false);
        break;
        case "stop": finishedPosition();
        break;
        case "draw": if(amIDrawingRef.current && !isPeerDrawingRef.current){
            draw(x,y);
        }
    }
}

const addActiveClass = (el)=>{
   ///remove any class of LS-active if it exists
   if(document.querySelector(".LC-active")){
    document.querySelector(".LC-active").classList.remove("LC-active");
   }
   el.classList.add("LC-active");
}

const changeHandler = (colors)=> {
    setCustomColor(colors.color);
    if(toolRef.current === "draw"){
        customEl.current.click();
    }
}

const download = ()=>{
    const monthArr = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const date = new Date();
    const timeStamp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const day = date.getDate();
    const month = monthArr[date.getMonth()];
    const year = date.getFullYear();
    // const fileName = `${day}-${month}-${year}-${timeStamp}.x-matroska;codecs=avc1,opus`;
    const fileName = `canvas-${day}-${month}-${year}-${timeStamp}.png`;
    // console.log(fileName);
    canvasRef.current.toBlob(blob=>{
        saveAs(blob, fileName);
    })
}

// const closeTools = ()=>{
//     document.querySelectorAll(".tools").forEach(el=>{
//         el.style.scale = "0";
//         el.style.width = "0";

//         // console.log(el)
//     })
// }



    return ( 
        <div style={{position: "relative"}}>
           <div ref={containerRef} className="liveCanvas--container" onScroll={(e)=>{
                if(scrollFromPeer.current){
                    scrollFromPeer.current = false;
                    return
                }
                    socket.emit("scroll", {x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop})
           }}>
             <canvas id="canvas" style={{backgroundColor: "white"}} ref={canvasRef} onMouseDown={drawFunc} onMouseUp={drawFunc} onMouseMove={drawFunc}></canvas>
             
           </div>
           
            <div className="liveCanvas--controls" ref={lcControls}>
                <button id="draw"  className="controls__draw LC-active tools"onClick={(e)=>{
                    changeTool("draw");
                    addActiveClass(e.currentTarget);
                    if(customizeBtn.current.classList.contains("colors-gone")){
                        customizeBtn.current.classList.remove("colors-gone")
                    }
                    document.querySelectorAll(".colors").forEach(el=>{
                        if(el.classList.contains("colors-gone")){
                            el.classList.remove("colors-gone");
                        }
                        el.classList.add("colors-visible");
                    })
                }}><img src={Pencil} alt=""/></button>
                <button id="erase" className="controls__erase tools" onClick={(e)=>{
                    changeTool("erase");
                    addActiveClass(e.currentTarget);
                    customizeBtn.current.classList.add("colors-gone");
                    document.querySelectorAll(".colors").forEach(el=>{
                        if(el.classList.contains("colors-visible")){
                            el.classList.remove("colors-visible");
                        }
                        el.classList.add("colors-gone");
                    })

                }}><img src={Eraser} alt=""/></button>
                <button id="clear" onClick={clear} className="tools"><img src={Trash} alt=""/></button>
                <button style={{backgroundColor: "white", position: "relative"}} className="tools" ref={customizeBtn}><img src={Customize} alt=""/><ColorPicker
                
                   animation="slide-up"
                   color={'#36c'}
                   onChange={changeHandler}
                 /></button>
                <button className="colors tools" style={{backgroundColor: customColorRef.current}} ref={customEl}></button>
                <button className="colors tools" style={{backgroundColor: "black"}}></button>
                <button className="colors tools" style={{backgroundColor: "red"}}></button>
                <button className="colors tools" style={{backgroundColor: "blue"}}></button>
                <button id="download" onClick={download}><img src={Download} alt=""/></button>

            </div>

        </div>
     );
}
 
export default React.memo(LiveCanvas);