import React, {useState, useEffect, useRef} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import Loading from '../Loading';
import Randomuser from "../../assets/randomuser.png";
import { useHistory, Link } from 'react-router-dom';
import moment from "moment";
import { nanoid } from 'nanoid';
import { Rating, RatingView } from 'react-simple-star-rating';


const RequestCardTutee = (props) => {
	const history = useHistory();
	const modalRef = useRef();
	const modalRef2 = useRef();
	const linkRef = useRef("");
	const [isLoading, setIsLoading] = useState(false);
	const roomNameRef = useRef();
	const otherUserID = props.requestObj.tutor.uid;
	let roomNameArr = [];
	const [rating, setRating] = useState(0) // initial rating value

	// Catch Rating value
	const handleRating = (rate) => {
	  setRating(rate)
	  // Some logic
	}

    roomNameArr.push(props.userDoc.uid);
    if(props.requestObj.tutor.type === "tutor"){
        roomNameArr.unshift(`${otherUserID}tutero`);
    }else{
        roomNameArr.push(`tutero${otherUserID}`)
    }
    roomNameRef.current = `${roomNameArr.join("")}`;

	const openModal = ()=>{
		console.log("its supposed to open")
		modalRef.current.classList.add("active");
		console.log("to the base");
	}
	const closeModal = ()=>{
		modalRef.current.classList.remove("active");
		// console.log(modalRef.current.classList.add("active"))
	}


	const confirmAndRate = ()=>{
		setIsLoading(true);
		//rate the tutor by incrementing the number in the tutor object
		//remove the request from the tutor's and tutee's user doc
		const firestore = firebase.firestore();
		console.log(firebase)
		async function confirm(){		
			try{
			   const addition = await firestore.collection("tutors").doc(otherUserID).update({
				   rating: firebase.firestore.FieldValue.arrayUnion(
					   {
						rating,
						id: nanoid(12)
					   }
					   )
			   })


			   const removeFromMinesnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
			   const removeFromMine = removeFromMinesnapshot.data().requests.find(el=>el.requestID === props.requestObj.requestID);
			   console.log(removeFromMine)
			   console.log(removeFromMinesnapshot.data().requests)
			   const removal = await firestore.collection("users").doc(props.userDoc.uid).update({
				   requests: firebase.firestore.FieldValue.arrayRemove(removeFromMine)
			   })

			   const removeFromTheirsnapshot = await firestore.collection("users").doc(otherUserID).get();
			   const removeFromTheirs = removeFromTheirsnapshot.data().requests.find(el=>el.requestID === props.requestObj.requestID);
			   console.log(removeFromTheirsnapshot.data())
			   const removal2 = await firestore.collection("users").doc(otherUserID).update({
				   requests: firebase.firestore.FieldValue.arrayRemove(removeFromTheirs)
			   })
			   setIsLoading(false);
			   console.log("we did it")
			   history.push("/account");
			}catch(e){
				console.log(e)
			}
		}
		confirm();


	}


	const deleteRequest = ()=>{

		setIsLoading(true);
		//rate the tutor by incrementing the number in the tutor object
		//remove the request from the tutor's and tutee's user doc
		const firestore = firebase.firestore();
		console.log(firebase)
		async function confirm(){		
			try{
			   const removeFromMinesnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
			   const removeFromMine = removeFromMinesnapshot.data().requests.find(el=>el.requestID === props.requestObj.requestID);
			   console.log(removeFromMine)
			   console.log(removeFromMinesnapshot.data().requests)
			   const removal = await firestore.collection("users").doc(props.userDoc.uid).update({
				   requests: firebase.firestore.FieldValue.arrayRemove(removeFromMine)
			   })

			   const removeFromTheirsnapshot = await firestore.collection("users").doc(otherUserID).get();
			   const removeFromTheirs = removeFromTheirsnapshot.data().requests.find(el=>el.requestID === props.requestObj.requestID);
			   console.log(removeFromTheirsnapshot.data())
			   const removal2 = await firestore.collection("users").doc(otherUserID).update({
				   requests: firebase.firestore.FieldValue.arrayRemove(removeFromTheirs)
			   })
			   setIsLoading(false);
			   console.log("we did it")
			   history.push("/account");
			}catch(e){
				console.log(e)
			}
		}
		confirm();	
	}
	

    return (
        
                <div className="cardRtutee" style={{position: "relative"}}>
					<div className="cardRtutee__topDiv u-margin-bottom">
						<div className="cardRtutee__topDiv__info">
							<div className="cardRtutee__img" style={{backgroundImage:`url(${props.requestObj.tutor.photoURL})`}}>
							</div>
							<div className="column">
									<p className="cardRtutee__name">{props.requestObj.tutor.name}</p>
									<div style={{display: "flex", alignItems: "center"}} >
										<h1 className="cardRtutee__time">Request made {moment(JSON.parse(props.requestObj.submitTime)).calendar()}</h1>
									</div>						
							</div>
						</div>
						<div className="cardRtutee__topDiv__buttons">
							<div>
								<Link to={`/direct/${roomNameRef.current}`}>
								  <button className="buttonn " title="send this tutor a direct message" >DM</button>
								</Link>
							</div>
						</div>
					</div>
				
				<div className="cardRtutee__bottomDiv">
                    <p className="cardRtutee__info u-margin-bottom">Status: {props.requestObj.status}</p>	
					{
						props.requestObj.status === "accepted" ? 
						<div className="u-margin-bottom">
						<div className="u-margin-bottom">
						<p className="cardRtutee__info u-margin-bottom">Visit this link to start the virtual tutorial (make sure the tutee visits the same link)</p>
						<a href={props.requestObj.link} target="_blank" className="normal-text green-text " style={{backgroundColor: '#1e1e1e', padding: "1rem", borderRadius: "20px"}}>{props.requestObj.link}</a>
						</div>
						
						<button className="buttonn" onClick={()=>{
							openModal();
						}}>Confirm Tutorial</button>
					   </div> :
					     !isLoading ? <button className="buttonn" onClick={deleteRequest}>Delete Request</button> : <button className="buttonn buttonn--nohover"><Loading size="medium"/></button>
					}
                    <p className="cardRtutor__info u-margin-top">Requested date and time: {moment(JSON.parse(props.requestObj.requestedDateTime)).calendar()}</p>
                  
				</div>

				<div className="modal"  ref={modalRef}>
					{
						!isLoading ? <button className="close-button" onClick={closeModal}>&times;</button> : <Loading size="small"/>
					}
					
					<div style={{textAlign: "center"}} className="u-margin-bottom">
						<p className="white-text bigger-text">Rate the tutor</p>
						<small className="normal-text white-text">By rating the tutor, you are confirming that the tutorial happened and you are satisfied with it. The funds will then be transferred to the tutor</small>
					</div>
					<div className="center-hrz--col">
					   <Rating onClick={handleRating} ratingValue={rating} /* Rating Props */ />
					   <p className="white-text normal-text">{rating}/5</p>
					   {
                        !isLoading ?
						rating !== 0 ? 
					   <button className="buttonn buttonn--flipped u-margin-top" onClick={confirmAndRate}>Confirm and rate</button>
					   : null : <button className="buttonn buttonn--nohover"><Loading size="medium"/></button>
					   }
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

export default connect(mapStateToProps, mapDispatchToProps)(RequestCardTutee)
