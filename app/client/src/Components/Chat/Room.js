import React, {useState, useRef, useContext, useEffect} from 'react'
import {socketContext} from "../../Context/SocketContext";
import {UIDContext} from "../../Context/UIDContext";
import {nanoid} from "nanoid";
import Message from '../Message';
import Logo from "../../assets/blabble.svg";
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import {Redirect, Link} from "react-router-dom";
import Loading from '../Loading';
import Down from "../../assets/arrow-down.svg";


const Room = (props) => {
  const socketRef = useRef(null);
  const uidRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState("");
  const [messageArr, setMessageArr] = useState([]);
  const [testArr, setTestArr] = useState([]);
  const downRef = useRef();
  const otherUserObjRef = useRef(null);
  const msgContainerRef = useRef();
  const messageArrRef = useRef();
  messageArrRef.current = messageArr
  socketRef.current = useContext(socketContext);
  uidRef.current = useContext(UIDContext);

  const otherIDArr = props.match.params.roomName.split("tutero");
  const otherID = otherIDArr.find(id=>id !== props.userDoc.uid);

   useEffect(()=>{
       if(msgContainerRef.current){
          scrollToBottom();
       }
})

const peerDeleted = (msgObj)=>{
  console.log("the peer deleted");
setMessageArr(state=> state.filter(el=>el.messageID !== msgObj.messageID)); 
}

const handleChange = (e)=>{
  setMessage(e.target.value);
}

const handleSubmit = (e)=>{
  e.preventDefault();
  sendMessage(message)
}

const sendMessage = (message)=>{
  const time = new Date()
  const messageObj = {
    msg: message,
    author: props.userDoc.uid,
    messageID: nanoid(12),
    timestamp: JSON.stringify(time),
    authorPic: props.userDoc.photoURL,
}
//send message to the server
  socketRef.current.emit("message", messageObj);
  console.log("sent message");
  console.log(socketRef.current);
//also save to firebase
const firestore = firebase.firestore();
async function postMessage(){
    const addition = await firestore.collection("messages").doc(props.match.params.roomName).update({
        messagesArr: firebase.firestore.FieldValue.arrayUnion(messageObj)
    })
}

postMessage();
}
  useEffect(()=>{
      //join the room
      socketRef.current.emit("join room", props.match.params.roomName);

      socketRef.current.on("message", (messageObj)=>{
          setMessageArr(state=>[...state, messageObj]);
      })

      socketRef.current.on("delete message", msgObj=>{
           peerDeleted(msgObj);
      })
      const firestore = firebase.firestore();

      //check if the messages id is in the dms array in the userObj and add it there
      async function checkOrAddToArr(){
        try{

          const userObjSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
          const userObj = userObjSnapshot.data();
          console.log(userObj);
          if(!userObj.dms.some(el => el.convoID === props.match.params.roomName)){
            //add the roomname to the array
               //get the userObj of the other person

              const otherUserObjSnapshot = await firestore.collection("users").doc(otherID).get();
              const otherUserObj = otherUserObjSnapshot.data();     
              otherUserObjRef.current = otherUserObj;
              const addition = await firestore.collection("users").doc(props.userDoc.uid).update({
              dms: firebase.firestore.FieldValue.arrayUnion({
                convoID: props.match.params.roomName,
                name: otherUserObj.name,
                photoURL: otherUserObj.photoURL
              })
            })
          }

      
          const otherUserObjSnapshot = await firestore.collection("users").doc(otherID).get();
          const otherUserObj = otherUserObjSnapshot.data();
          if(!otherUserObj.dms.some(el => el.convoID === props.match.params.roomName)){
            //add the roomname to the array
               //get the userObj of the other person 
               console.log(props.userDoc);
              const addition = await firestore.collection("users").doc(otherID).update({
              dms: firebase.firestore.FieldValue.arrayUnion({
                convoID: props.match.params.roomName,
                name: props.userDoc.name,
                photoURL:  props.userDoc.photoURL
              })
            })

            console.log("addition successful")

          }

        }catch(e){
          console.log(e)
        }

      }

      checkOrAddToArr();



      //check if a messages doc exists, if it does not exist, then create one.
      async function checkOrCreateDoc(){
          try{
            const docSnapshot = await firestore.collection("messages").doc(props.match.params.roomName).get();
            if(!docSnapshot.exists){
                const docCreation = await firestore.collection("messages").doc(props.match.params.roomName).set({
                    messagesArr: []
                })
                setIsReady(true);
            }else{
                const messagesSnapshot = await firestore.collection("messages").doc(props.match.params.roomName).get();
                // console.log(messagesSnapshot.exists);
                const messages = messagesSnapshot.data().messagesArr;
                // console.log(messages)
                setMessageArr(messages);
                setIsReady(true);
            }
          }catch(e){

          }

      }
      checkOrCreateDoc();

      //cleanup code...if the messages state is empty, we assume that no converstion happened, so we remove the conversation from the dms list

      async function removeConvo(){
        try{
          const convoObjSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
          const objToRemove = convoObjSnapshot.data().dms.find(el=> el.convoID === props.match.params.roomName);
          console.log(objToRemove);
          const removal = await firestore.collection("users").doc(props.userDoc.uid).update({
            dms: firebase.firestore.FieldValue.arrayRemove(objToRemove)
          })

          const otherUserObjSnapshot = await firestore.collection("users").doc(otherID).get();
          console.log(otherUserObjSnapshot.data())
          const objectToRemove2 = otherUserObjSnapshot.data().dms.find(el=> el.convoID === props.match.params.roomName);
                    const removal2 = await firestore.collection("users").doc(otherID).update({
            dms: firebase.firestore.FieldValue.arrayRemove(objectToRemove2)
          })


        }catch(e){
          console.log(e)
        }

      }

      return ()=>{
        console.log(messageArrRef.current);
        if(messageArrRef.current.length === 0){
          removeConvo();
        }
      }
  },[])

  

  if(!props.authStatus || !props.userDoc.hasOwnProperty("type")){
    return <Redirect to="/account"/>
  }


  const newArr = props.match.params.roomName.split("tutero");
  if(!newArr.some(el=> el === props.userDoc.uid)){
    return <Redirect to="/account"/>
  }



  const deleteMessageFunc = (msgObj)=>{
      //indexOf the object in the msgArray in local state, then splice it
      setMessageArr(state=> state.filter(el=>el.messageID !== msgObj.messageID)); 
      //remove the element from the message array in firestore
      const firestore = firebase.firestore()
      async function deleteMessage(){
          const deletion = await firestore.collection("messages").doc(props.match.params.roomName).update({
              messagesArr: firebase.firestore.FieldValue.arrayRemove(msgObj)
          })
      }
      deleteMessage();

      //tell your peer to delet their message
     socketRef.current.emit("delete message", msgObj);
      
  }

 const scrollToBottom =()=>{
    msgContainerRef.current.scrollTo(0, msgContainerRef.current.scrollHeight);
}



  return (
      //this div👇 contains the message container
        <div className="screen">
        {
            isReady ? 
            <>
               <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {/* this div👇 contains the messages */}
            <div className="message-container" ref={msgContainerRef}>
                {
                    messageArr.map(messageEl=><Message messageObj={messageEl} currentUID={props.userDoc.uid} deleteFunc={deleteMessageFunc} key={messageEl.messageID}/>)
                }
                <button className="button--round" ref={downRef} onClick={scrollToBottom}><img src={Down} alt="" /></button>
            </div>
            

            {/* this👇 div contains the form */}
            <div>
                {/* this is the form 👇 */}
                <form className="message-input u-margin-bottom" onSubmit={handleSubmit}>
                    {/* this div👇 contains the input and the button */}
                    <div>

                        {/* this is the input👇 */}
                        <center>
                          <input className="text-message-input" type="text" placeholder="Type a message" onChange={handleChange} value={message} required/>
                          {/* this is the button👇 */}         
                          <button className="btn" type="submit">Send</button>
                        </center>
                    </div>         
                </form>
            </div>
        </div>
            </> : <div className="center-hrz"><Loading/></div>
        }
        </div>
    )
}

const mapStateToProps = state=>({
    authStatus: state.authStatus,
    userDetails: state.userDetails,
    userDoc: state.userDoc
  })
  
  const mapDispatchToProps = dispatch=>{
    return bindActionCreators(actionCreators, dispatch)
  }


export default connect(mapStateToProps, mapDispatchToProps)(Room)
