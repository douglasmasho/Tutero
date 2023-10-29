import React, { useEffect, useRef, useState , useContext} from 'react';
import {socketContext} from "../Context/socketContext";

const worker = new Worker("../worker.js");

const FileShare = (props) => {
    const peer = props.peer,
          connectionMade = props.connectionMade,
          socketRef = useRef(),
          fileInpRef= useRef(),
          fileRef = useRef(null),
          progressRef = useRef(),
          downloadBtn = useRef(),
          [file, SetFileState] = useState(null);
          socketRef.current = useContext(socketContext);
          fileRef.current = file;


          const setFile = (e)=>{
            SetFileState(e.target.files[0]);
            console.log(e.target.files[0], fileRef);
        }
    
    
        const uploadFile = (e)=>{
            e.preventDefault();
            const fileSlice = file.slice(0,100000);
            console.log(fileSlice);
            ////fuhireuhiuhieufhiufehiuhfeiuhfeiuh dev 3
            fileInpRef.current.style.display = "none"
    
            socketRef.current.emit("slice upload", {
                name: file.name,
                size: file.size,
                type: file.type,
                data: fileSlice, ///the data should be the array buffer of the current slice
            })     
        }


     useEffect(()=>{

        worker.addEventListener("message" ,event=>{ 
            switch(event.data.type){
                case "request new slice":
                    socketRef.current.emit("request new slice from peer", event.data);
                    const progress = ((event.data.currentSlice * 100000) / event.data.size) * 100;
                    console.log(progress)
                    progressRef.current.value = progress;
                    console.log(progressRef.current)
                    break;
                case "file upload complete":
                    progressRef.current.value = 100;
                    setTimeout(()=>{
                        progressRef.current.value = 0;
                    }, 2000)
                    const bufferArr = event.data.fileObj.data;
                    console.log(event.data.fileObj.data);
                    ////////////this is where you do the file download stuff
                    const fileBlob = new Blob(bufferArr);
                    console.log(fileBlob);

                    const downloadBlob = (blob, name)=>{
                        const blobUrl = URL.createObjectURL(blob);

                        const link = document.createElement("a");

                        link.href = blobUrl;
                        link.download = name;

                        downloadBtn.current.appendChild(link);

                        link.dispatchEvent(
                            new MouseEvent('click', { 
                              bubbles: true, 
                              cancelable: true, 
                              view: window 
                            })
                          );
                        
                          // Remove link from body
                          downloadBtn.current.removeChild(link);
                    }
                    downloadBlob(fileBlob, event.data.fileObj.name);
                    socketRef.current.emit("upload complete")///send to first peer that the upload is complete       
            }
        })


        socketRef.current.on("slice received", data=>{
            console.log("slice received");
            worker.postMessage(data);
        })

        socketRef.current.on("end upload", ()=>{
            console.log("your upload has ended");
            fileInpRef.current.style.display = "block";
            progressRef.current.value = 100;
            setTimeout(()=>{
                progressRef.current.value = 0;
            }, 2000)

        })

        socketRef.current.on("upload error", ()=>{
            console.log("there has been an error mybruh")
        })

        socketRef.current.on("new slice request", data=>{
            console.log(data.currentSlice);
            const position = data.currentSlice * 100000;
            const progress = (position / fileRef.current.size) * 100;
            progressRef.current.value = progress;
            ///async function so dont use state, use ref
            const newSlice = fileRef.current.slice(position, position + Math.min(100000, fileRef.current.size - position));
            console.log(newSlice);

            socketRef.current.emit("slice upload", {
                name: fileRef.current.name,
                size: fileRef.current.size,
                type: fileRef.current.type,
                data: newSlice, ///the data should be the array buffer of the current slice
            })
            
        })

        socketRef.current.on("upload complete", ()=>{
            console.log("the upload is complete")
        })

     }, [])

    return ( 
        <div className="center-hrz fileshare--container center-vert--row">
                 <form onSubmit={uploadFile}>
                   <input type="file" ref={fileInpRef} onChange={setFile} className="fileshare--input u-margin-bottom"/>
                   {file ? (<div className="center-hrz--col u-margin-bottom">
                      <button type="submit" className="fileshare--button u-margin-bottom">Submit</button>
                   </div>) : null}
                   <progress min="0" max="100" ref={progressRef} value="0" className="fileshare--progress"></progress>
                   <div ref={downloadBtn}>
                   </div>
                </form>
        </div>
     );
}


 
export default FileShare