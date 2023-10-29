import React from 'react';
import DMList from '../DMList';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import { useEffect } from 'react';
import Suggestion from './suggestion';
import firebase from 'firebase/app';
import RequestCardTutee from "../Request/RequestCardTutee";
import TutorCardParent from '../TutorCardParent';


const TuteeDash = (props) => {

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


const getSeconds = (dateObj)=>{
  const date = new Date(JSON.parse(dateObj));
  const seconds = date.getTime();
  return seconds;
}
    return (
        <div>
         {/* <DMList type={"tutor"}/> */}
           {/* <img src={props.userDetails.photoURL} alt="profile Image" /> */} 
           <div className="center-hrz text-size center-vert--row">
                    <div style={{backgroundImage: `url(${props.userDetails.photoURL})`}} className="profile_pic"></div>
                    <div style={{margin: "40px 0px 0px 20px"}}>
                    <p >Hello,
                    <br/><span style={{fontWeight: "bold"}}>
                    {props.userDetails.displayName}</span></p>
                    </div>
           </div>
           
           <h1 className="center-hrz text-size" style={{marginTop: "20px"}}>What would you like to learn today?</h1>
           <div className="grid grid-3 subjects-parent">
               {
                   props.userDoc.subjects.map(el=><Suggestion subject={el} key={el}/>)
               }
           </div>

           <section id="requestsTutee" className="u-margin-bottom-big">
                <div className="center-hrz">
                <h1 className="screen__header" >Tutorial requests you made</h1>
                </div>
              <div className="center-hrz--col">
                {
                    props.userDoc.requests ?
                    props.userDoc.requests.length !== 0 ?
                    props.userDoc.requests.map(el=>el).sort((a,b)=>getSeconds(b.submitTime)-getSeconds(a.submitTime)).map(el=><RequestCardTutee requestObj={el} key={el.requestID}/>) : <p className="bigger-text" style={{backgroundColor: 'white', padding: "1rem" , borderRadius: "20px"}}>No Requests</p> 
                    :
                    null
                }

              </div>

            </section>

            <section id="faveTutors">
              <div className="center-hrz">
                  <h1 className="screen__header" >Your Favorite Tutors</h1>
              </div>

              <div className="">
                  {
                    props.userDoc.favorites ?
                    props.userDoc.favorites.length !== 0 ?
                    props.userDoc.favorites.map(el=><TutorCardParent key={el} userID={el}/>) : <p className="bigger-text" style={{backgroundColor: 'white', padding: "1rem" , borderRadius: "20px"}}>No Favorites</p> 
                    : null
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

export default connect(mapStateToProps, mapDispatchToProps)(TuteeDash)
