import React, {useEffect} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import {compose} from "redux";
import Logo from "../assets/blabble.svg";
import {Redirect, Route, Link, } from "react-router-dom";
import TutorDash from "./Dashboard/TutorDash";
import TuteeDash from "./Dashboard/TuteeDash";

const Home = (props) => {

    useEffect(()=>{
        console.log(props.userDetails)
      })
      console.log(firebase.auth().currentUser);
    
      if(!props.authStatus || !props.userDoc.hasOwnProperty("type")){
        return <Redirect to="/account"/>
      }

      
    return (
        <>  
        <div className="screen">
            <div className="Home">
                  {
                      props.userDoc.type === "tutor" ?
                      <TutorDash/>:<TuteeDash/>
                  }
              </div> 
        </div>

      </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Home)
