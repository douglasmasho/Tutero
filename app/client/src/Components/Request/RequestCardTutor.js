import React, {useState, useEffect, useRef} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import moment from "moment";
import { Link } from 'react-router-dom';
import { nanoid } from 'nanoid';
import firebase from 'firebase/app';
import Loading from '../Loading';
import { useHistory } from 'react-router-dom';
import Randomuser from "../../assets/randomuser.png";

const RequestCardTutor = (props) => {
    const history = useHistory();
	const modalRef = useRef();
	const modalRef2 = useRef();
	const linkRef = useRef("");
	const [isLoading, setIsLoading] = useState(false);

    const openModal = (type)=>{
		switch(type){
			case "accept": 
			modalRef.current.classList.add("active");
			modalRef2.current.classList.remove("active");
			break;
			case "decline": 
			modalRef2.current.classList.add("active");
			modalRef.current.classList.remove("active");
		}
    }
    const closeModal = (type)=>{
		history.push("/account");
		console.log("its supposed to push")
		switch(type){
			case "accept": 
			modalRef.current.classList.remove("active");
			break;
			case "decline": 
			modalRef2.current.classList.remove("active");
			break;
			default: 
		}
    }

	const roomNameRef = useRef();
	const otherUserID = props.requestObj.tutee.uid;
	let roomNameArr = [];
    roomNameArr.push(props.userDoc.uid);
    if(props.requestObj.tutee.type === "tutor"){
        roomNameArr.unshift(`${otherUserID}tutero`);
    }else{
        roomNameArr.push(`tutero${otherUserID}`)
    }
    roomNameRef.current = `${roomNameArr.join("")}`;
	console.log(roomNameRef.current);

	const acceptRequest = ()=>{
		setIsLoading(true);
		const firestore = firebase.firestore();
		async function acceptInFB(){
			try{	
				const userDocSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
				const userDoc = userDocSnapshot.data();
			  //get their previous array from firebase
				const tuteeSnapshot = await firestore.collection("users").doc(otherUserID).get();
				const tutee = tuteeSnapshot.data();
				console.log(tutee);
				console.log(userDoc);
				const previousObjTheirs = tutee.requests.find(el=>el.requestID === props.requestObj.requestID);
				const previousObjMine = userDoc.requests.find(el=>el.requestID === props.requestObj.requestID);
				
				const removalFromMine = await firestore.collection("users").doc(props.userDoc.uid).update({
									requests: firebase.firestore.FieldValue.arrayRemove(previousObjMine)
					})
				const removalFromTheirs = await firestore.collection("users").doc(otherUserID).update({
						requests: firebase.firestore.FieldValue.arrayRemove(previousObjTheirs)
					})


				//generate a room link
				const newLink = `https://tuterolive.herokuapp.com/room/${nanoid(12)}`;
				linkRef.current = newLink;
				//construct the new objects
				const previousObj = props.requestObj;
				const newObjMine = {
					...previousObj,
					status: "accepted",
					link: newLink
				}

				const newObjTheirs = {
					...previousObj,
					status: "accepted",
					link: newLink,
					tutor: userDoc
				}

				delete newObjTheirs.tutee

				//then add the new object with the modified status to the arrays
				const additionToMine = await firestore.collection("users").doc(props.userDoc.uid).update({
					requests: firebase.firestore.FieldValue.arrayUnion(newObjMine)
				})
				const additonToTheirs = await firestore.collection("users").doc(otherUserID).update({
					requests: firebase.firestore.FieldValue.arrayUnion(newObjTheirs)
				})

				console.log("It actually worked!");
		        setIsLoading(false);
				openModal("accept")

			}catch(e){
				console.log("You blundered");
				console.log(e)
			}
		}
		acceptInFB()
	}

	const declineRequest = ()=>{
		setIsLoading(true);
		const firestore = firebase.firestore();
		async function declineInFB(){
			try{	
				const userDocSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
				const userDoc = userDocSnapshot.data();
			  //get their previous array from firebase
				const tuteeSnapshot = await firestore.collection("users").doc(otherUserID).get();
				const tutee = tuteeSnapshot.data();
				console.log(tutee);
				console.log(userDoc);
				const previousObjTheirs = tutee.requests.find(el=>el.requestID === props.requestObj.requestID);
				const previousObjMine = userDoc.requests.find(el=>el.requestID === props.requestObj.requestID);
				
				const removalFromMine = await firestore.collection("users").doc(props.userDoc.uid).update({
									requests: firebase.firestore.FieldValue.arrayRemove(previousObjMine)
					})
				const removalFromTheirs = await firestore.collection("users").doc(otherUserID).update({
						requests: firebase.firestore.FieldValue.arrayRemove(previousObjTheirs)
					})


				//generate a room link
				
				//construct the new objects
				const previousObj = props.requestObj;
				const newObjMine = {
					...previousObj,
					status: "declined",
					link: ""
				}

				const newObjTheirs = {
					...previousObj,
					status: "declined",
					link: "",
					tutor: userDoc
				}

				delete newObjTheirs.tutee

				//then add the new object with the modified status to the arrays
				const additionToMine = await firestore.collection("users").doc(props.userDoc.uid).update({
					requests: firebase.firestore.FieldValue.arrayUnion(newObjMine)
				})
				const additonToTheirs = await firestore.collection("users").doc(otherUserID).update({
					requests: firebase.firestore.FieldValue.arrayUnion(newObjTheirs)
				})

				console.log("It actually worked!");
		        setIsLoading(false);
				openModal("decline");

			}catch(e){
				console.log("You blundered");
				console.log(e)
			}
		}
		declineInFB()
	}


    return (
        <div className="cardRtutor" style={{position: "relative"}}>
					<div className="cardRtutor__topDiv u-margin-bottom">
						<div className="cardRtutor__topDiv__info">
							<div className="cardRtutor__img" style={{backgroundImage:`url(${props.requestObj.tutee.photoURL})`}}>
							</div>
							<div className="column">
									<p className="cardRtutor__name">{props.requestObj.tutee.name}</p>
									<div style={{display: "flex", alignItems: "center"}} >
										<h1 className="cardRtutor__time">Request made {moment(JSON.parse(props.requestObj.submitTime)).calendar()}</h1>
									</div>						
							</div>
						</div>
						<div className="cardRtutor__topDiv__buttons">
							<Link to={`/direct/${roomNameRef.current}`}>
								<div>
								<button className="buttonn " title="send this tutee a direct message">DM</button>
								</div>
							</Link>
                         { 		 
						 !isLoading ?
						 <>
                            <div>
                            <button className="buttonn " title="accept this request" onClick={acceptRequest}>
								Accept 
							</button>
                            </div>
                            <div>
                            <button className="buttonn " title="decline this request" onClick={declineRequest}>
							      Decline 
								</button>   
                            </div>
							</> : 
							<button className="buttonn buttonn--nohover"><Loading size="medium"/></button>				
                         }
						</div>
					</div>

				<div className="cardRtutor__bottomDiv">
				       {
							 !isLoading ?
							 props.requestObj.status === "accepted" ? <p className="normal-text">Accepted</p> :
							 props.requestObj.status === "declined" ?
							 <p className="normal-text red-text">Declined</p> :  <p className="normal-text">Pending</p>
							 :
							 <Loading size="medium"/>
						 }
                    <p className="cardRtutor__info u-margin-bottom">{props.requestObj.subject}</p>	
                    <p className="cardRtutor__info u-margin-bottom">Requested date and time: {moment(JSON.parse(props.requestObj.requestedDateTime)).calendar()}</p>
					<div>
						{
							props.requestObj.link !== ""? 
							<div>
                              <p className="cardRtutor__info u-margin-bottom">Tutorial Link:</p>
							  <a href={props.requestObj.link} target="_blank" className="normal-text green-text " style={{backgroundColor: '#1e1e1e', padding: "1rem", borderRadius: "20px"}}>{props.requestObj.link}</a>
							</div>	
							: null
						}
					</div>
				</div>

		 <div className="modal"  ref={modalRef}>
            <button className="close-button" onClick={()=>{
                closeModal("accept")
			}}>&times;</button>
              <div style={{textAlign: "center"}} className="u-margin-bottom">
                <p className="white-text bigger-text">A tutorial room link has been sent to {props.requestObj.tutee.name}</p>
                  <small className="normal-text white-text">Visit this link to start the virtual tutorial (make sure the tutee visits the same link)</small> <br />
                  <a className="normal-text green-text" href={linkRef.current} target="_blank">{linkRef.current}</a>
             </div>
			 <div className="center-hrz">
				<button className="buttonn"  onClick={()=>{
					closeModal("accept")
				}}>OK</button>
			 </div>
            </div>

			<div className="modal"  ref={modalRef2}>
            <button className="close-button" onClick={()=>{
                closeModal("decline")
			}}>&times;</button>
              <div style={{textAlign: "center"}} className="u-margin-bottom">
                <p className="white-text bigger-text">You have Declined {props.requestObj.tutee.name}'s tutorial request</p>
				<button className="buttonn"  onClick={()=>{
                closeModal("decline")
			}}>OK</button>
              </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(RequestCardTutor)
