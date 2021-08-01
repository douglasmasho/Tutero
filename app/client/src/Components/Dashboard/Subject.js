import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import {Redirect, Route, Link} from "react-router-dom";
import firebase from 'firebase/app';
import {firestoreConnect} from "react-redux-firebase"
import Loading from '../Loading';
import TutorCard from '../TutorCard';

const Subject = (props) => {
    const currentRoute = props.match.params.subject;
    const [tutors, setTutors] = useState();

    useEffect(()=>{
        //fetch all the math tutors from firebase firestore
        const firestore = firebase.firestore();

        async function fetchTutors(){
            try{
                const querySnapShot = await firestore.collection("tutors").where("categories", "array-contains", currentRoute).get();
                const tutorsArr = [];
                querySnapShot.docs.forEach(doc=>{
                    console.log(doc.data());
                    tutorsArr.push(doc.data());
                })
                setTutors(tutorsArr);
            }catch(e){
                console.log(e)
            }

        }

        fetchTutors();
        //

        // const firestore = firebase.firestore();
		async function getUserObj(){
			try{
				const userObjSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
				const userObj = userObjSnapshot.data();
				props.setUserDoc(userObj);
				console.log("getUserObj worked");
				console.log(props.userDoc);
			}catch(e){
				console.log(e)
			}
		}
		getUserObj()
    },[])

    if(!props.authStatus || !props.userDoc.hasOwnProperty("type")){
        return <Redirect to="/account"/>
    }

    if(props.userDoc.type !== "tutee"){
		return <Redirect to="/account"/>
	}

    return (
        <div className="screen">
            <div className="center-hrz">
               <h1 className="screen__header">{props.match.params.subject} Tutors</h1>
            </div>
            <div className="center-hrz--col">
                    {
                        tutors && tutors.length !== 0 ?
                        tutors.map(el=><TutorCard name={el.name} photoURL={el.photoURL} key={el.uid} uid={el.uid} userObj={el} />) : <Loading/>
                    }
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

export default connect(mapStateToProps, mapDispatchToProps)(Subject);
