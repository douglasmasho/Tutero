import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import Loading from './Loading';
import {Link} from "react-router-dom";

//userObj is the object of the current tutor
//userDoc is the user object of the current tutee/ ie the user viewing this page

const TutorCard = (props) => {
	const [fave,setFave] = useState(false);
	const [isLoading ,setIsLoading] = useState(false);


	let roomNameArr = [];
    roomNameArr.push(props.userDoc.uid);
    if(props.userObj.type === "tutor"){
        roomNameArr.unshift(`${props.userObj.uid}tutero`);
    }else{
        roomNameArr.push(`tutero${props.userObj.uid}`)
    }
    const roomName = `${roomNameArr.join("")}`;

	// console.log(props.userDoc);
	useEffect(()=>{
		const faveArr = props.userDoc.favorites;
		// console.log(faveArr);
		// console.log(props.userObj.uid)

		//check if the userID is in the favoritesArr;
		const faveBool = faveArr.some(el=> el === props.userObj.uid);
		// console.log(faveBool);
		setFave(faveBool);
	},[]);

	const toggleFave = ()=>{
		const firestore = firebase.firestore();
		setIsLoading(true);
		//add or remove the fave from the user's and tutees array on firebase depending on the current state;
		async function changeFave(){
			try{
				if(fave){
					//remove from
					//users collection
					const removalFromUsers = await firestore.collection("users").doc(props.userDoc.uid).update({
						favorites: firebase.firestore.FieldValue.arrayRemove(props.userObj.uid)
					});
					//tutee collection
					const removalFromTutees = await firestore.collection("tutees").doc(props.userDoc.uid).update({
						favorites: firebase.firestore.FieldValue.arrayRemove(props.userObj.uid)
					})
				}else{
					//add to
					//users collection
					const additionToUsers = await firestore.collection("users").doc(props.userDoc.uid).update({
						favorites: firebase.firestore.FieldValue.arrayUnion(props.userObj.uid)
					});
					//tutee collection
					const additionToTutees = await firestore.collection("tutees").doc(props.userDoc.uid).update({
						favorites: firebase.firestore.FieldValue.arrayUnion(props.userObj.uid)
					})
				}
				console.log("changeFave worked");
		        getUserObj();
			}catch(e){
				console.log(e)
			}
		}
		changeFave();

		//change the fave local state;
		//fetch the userObj again and update the redux persist state;
		async function getUserObj(){
			try{
				const userObjSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
				const userObj = userObjSnapshot.data();
				props.setUserDoc(userObj);
				console.log("getUserObj worked");
		        setFave(state=>!state);
		        setIsLoading(false);
				console.log(props.userDoc);
			}catch(e){
				console.log(e)
			}
		}

	}

	const getRating = ()=>{
		const ratingArr = props.userObj.rating;
		console.log(ratingArr);
		if(ratingArr.length !== 0){
			const outOfFive = ratingArr.reduce((a,c)=>a+c.rating, 0) / ratingArr.length;
		    return outOfFive;
		}else{
			return ""
		}
	}




    return (
        <div className="card">
					<div className="card__topDiv">
						<div className="card__topDiv__info">
							<div className="card__img" style={{backgroundImage:`url(${props.photoURL})`}}>
							</div>
							<div className="column">
									<p className="card__name">{props.name}</p>
									<div style={{display: "flex", alignItems: "center"}} >
										<h1 className="card__price">N$ {props.userObj.rate}<span>/hr</span></h1>
										<div className="card__rating">
											{
												!getRating() == ""?
												<p className="card__rating">{getRating()}/5<i className="fa fa-star star card__star" aria-hidden="true"></i></p>
												: null
											}
										</div>
									</div>						
							</div>
						</div>
						<div className="card__topDiv__buttons">
							<div>
							   <Link to={`/direct/${roomName}`}><button className="buttonn button-tutor-card-small-screen" title="send this tutor a direct message" onClick={()=>{
								   console.log(roomName)
							   }}>DM</button></Link>
							</div>
							<div>
							  <Link to={`/request/${props.userObj.uid}`}><button className="buttonn button-tutor-card-small-screen" title="request a tutorial">Request</button></Link> 
							</div>
							<div>
							   <button className="buttonn button-tutor-card-small-screen" onClick={ toggleFave} title={fave ? "Remove from favorites" : "Add to favorites"}>
								   {
									   isLoading ? <Loading size="small"/> : 							   
									   fave ? <i className="fas fa-heart"></i> : 
									   <i className="far fa-heart"></i>
								   }				     
								   </button>
							</div>

						</div>
					</div>
				
				<div className="card__bottomDiv">
					<div className="grid grid-2">
					<div className="card__list">
					   <h3 className="card__list__header">Specific subjects</h3>
					   <ul className="card__list__list">
						   {
							   props.userObj.specSubs.map(el=>(
								   <li className="capitalize" key={el}>{el}</li>
							   ))
						   }
					   </ul>

					</div>

					<div className="card__list">
					   <h3 className="card__list__header">General subjects</h3>
						<ul className="card__list__list">
						   {
							   props.userObj.categories.map(el=>(
								   <li className="capitalize" key={el}>{el}</li>
							   ))
						   }

						</ul>
					</div>

					<div className="card__list">
					   <h3 className="card__list__header">Credentials</h3>
						<ul className="card__list__list">
						{
							   props.userObj.credentials.map(el=>(
								   <li className="capitalize" key={el}>{el}</li>
							   ))
						   }
						</ul>
					</div>

					<div className="card__list">
					   <h3 className="card__list__header">Levels Tutored</h3>
						<ul className="card__list__list">
						{
							   props.userObj.levels.map(el=>(
								   <li className="capitalize" key={el}>{el}</li>
							   ))
						   }
						</ul>
					</div>

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


export default connect(mapStateToProps, mapDispatchToProps)(TutorCard);
