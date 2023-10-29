import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import firebase from 'firebase/app';
import UserThumb from './UserThumb';


const DMList = ({type, ...props}) => {
    const [otherParties, setOtherParties] = useState([])
    useEffect(()=>{
        //get the list of tutors/tutees from firebase
        const firestore = firebase.firestore();
        async function getOthers(type){
            const othersSnapshot = await firestore.collection(`${type}s`).get();
            const others = othersSnapshot.docs.map(doc=>doc.data());
            console.log(others)
            setOtherParties(others);
        }
        getOthers(type);
    }, [])

    useEffect(()=>{
        console.log(otherParties)
    })
    return (
    <div>
        <h1>A list of {`${type}s`} to DM</h1>
        
        {
            otherParties.map(el=><UserThumb otherUser={el} myUID={props.userDoc.uid}/>)
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

export default connect(mapStateToProps, mapDispatchToProps)(DMList)
