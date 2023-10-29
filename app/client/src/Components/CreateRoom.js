import React, {useEffect, useRef} from 'react';
import { nanoid } from 'nanoid';
import TLlogo from "../../src/assets/tuterolive.svg";
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import {Redirect} from "react-router-dom";

const CreateRoom = (props) => {
    const linkRef = useRef();
    linkRef.current =  `https://tuterolive.herokuapp.com/room/${nanoid(12)}`;

    if(!props.authStatus || !props.userDoc.hasOwnProperty("type")){
        return <Redirect to="/account"/>
    }

    return (
        <div className="screen">
            <div className="center-hrz">
                <img src={TLlogo} alt="" className="liveLogo"/>
            </div>

            <div class="center-item-horizontal">
                <h1 class="header">Go Live</h1>
            </div>

            <div class="center-item-horizontal">
    <div className="card">
      {/* <center> */}
      <div className="center-hrz--col">
        <p className="normal-text">Visit and share this link to start the virtual tutorial (make sure your tutor/tutee visits the same link)</p>
                <div className="link-box">
                        <p className="normal-text u-margin-bottom"><span style={{fontWeight: "bold"}}>Your Room Link Is: </span></p>
							  <a href={linkRef.current} target="_blank" className="normal-text green-text " style={{backgroundColor: '#1e1e1e', padding: "1rem", borderRadius: "20px"}}>{linkRef.current}</a>
                    <br/>
                </div>
            {/* </center> */}

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


export default connect(mapStateToProps, mapDispatchToProps)(CreateRoom)
