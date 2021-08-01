//this wil;l fetch the individual data from firebase and render the tutorCard that was favorited
import React, {useEffect, useState} from 'react';
import firebase from 'firebase/app';
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import TutorCard from './TutorCard';
import Loading from './Loading';


const TutorCardParent = (props) => {
    const [userObject, setUserObject] = useState(null)
    useEffect(()=>{
        console.log(props.userID);

        //fetch the object from firebase from the tutors collection
        const firestore = firebase.firestore();
        async function getUserObj(){
            try{
                const userObjSnapshot = await firestore.collection("tutors").doc(props.userID).get();
                const userObj = userObjSnapshot.data();
                setUserObject(userObj);
            }catch(e){
                console.log(e)
            }

        }

        getUserObj();

    },[])
    return (
       <div className="center-hrz">
           {
              userObject ? 
              <TutorCard name={userObject.name} photoURL={userObject.photoURL} key={userObject.uid} uid={userObject.uid} userObj={userObject}/> : 
              <div className="card" style={{backgroundColor: '#1e1e1e',}}>
              <Loading size="medium" />
              </div>
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


export default connect(mapStateToProps, mapDispatchToProps)(TutorCardParent)
