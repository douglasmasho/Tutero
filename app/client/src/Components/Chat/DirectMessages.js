import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import {Redirect, Route, Link} from "react-router-dom";
import firebase from 'firebase/app';
import MessageThumb from './MessageThumb';
import Loading from "../Loading";



const DirectMessages = (props) => {
    const firestore = firebase.firestore();
    const [dms, setDms] = useState([]);
    //fetch the userDoc from firestore


    useEffect(()=>{
        async function fetchDoc(){
            try{
                const newUserDocSnapShot = await firestore.collection("users").doc(props.userDoc.uid).get();
                const newUserDoc = newUserDocSnapShot.data();
                setDms(newUserDoc.dms);
            }catch(e){
                console.log(e);
            }
        }

        fetchDoc();

    },[]);

    if(!props.authStatus || !props.userDoc.hasOwnProperty("type")){
        return <Redirect to="/account"/>
    }


    return (
        <div className="screen">
            <div className="center-hrz">
                <h1 className="screen__header">Your Direct Messages</h1>
            </div>
            <div className="center-hrz--col">
                {
                    dms ? dms.length !== 0 ? dms.map(el=><MessageThumb key={el.convoID} convoObj={el}/>) : <Loading/> : <p>No <details></details></p>
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


export default connect(mapStateToProps, mapDispatchToProps)(DirectMessages);
