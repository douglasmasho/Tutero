import React, {useEffect, useState, useRef} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import RequestCardTutor from "../Request/RequestCardTutor";
import Modal from 'react-modal';

const TutorDash = (props) => {
    const modalRef = useRef();

    useEffect(()=>{
        const firestore = firebase.firestore();
        //fetch the user object from firebase and update the one in redux
        async function getUserObj(){
            try{
                const userObjSnapshot = await firestore.collection("users").doc(props.userDoc.uid).get();
                const userObj = userObjSnapshot.data();
                props.setUserDoc(userObj);
            }catch(e){
                console.log(e)
            }
            
        }
        getUserObj()
    },[])

    useEffect(()=>{
        console.log(props.userDoc.requests);
    },[])

    const getSeconds = (dateObj)=>{
        const date = new Date(JSON.parse(dateObj));
        const seconds = date.getTime();
        return seconds;
      }
    return (
        <div>
            <div className="center-hrz text-size center-vert--row u-margin-bottom">
                    <div style={{backgroundImage: `url(${props.userDetails.photoURL})`}} className="profile_pic"></div>
                    <div style={{margin: "40px 0px 0px 20px"}}>
                    <p>Hello,
                    <br/><span style={{fontWeight: "bold"}}>{props.userDetails.displayName}</span></p>
                    </div>
           </div>

            <section id="requestsTutor">
                <div className="center-hrz">
                <h1 className="screen__header" >Tutorial requests</h1>
                </div>
              <div className="center-hrz--col">
                {
                    props.userDoc.requests ? 
                    props.userDoc.requests.length !== 0 ?
                    props.userDoc.requests.map(el=>el).sort((a,b)=>getSeconds(b.submitTime)-getSeconds(a.submitTime)).map(el=><RequestCardTutor requestObj={el} key={el.requestID}/>) : <p className="bigger-text" style={{backgroundColor: 'white', padding: "1rem" , borderRadius: "20px"}}>No Requests</p>
                     :
                    null
                }

              </div>

            </section>

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


export default connect(mapStateToProps, mapDispatchToProps)(TutorDash)
