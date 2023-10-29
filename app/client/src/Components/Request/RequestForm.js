import React, {useState} from 'react';
import {connect} from "react-redux";      
import * as actionCreators from "../../redux/actions";
import {bindActionCreators} from "redux";
import DateTimePicker from 'react-datetime-picker';
import { nanoid } from 'nanoid';
import firebase from 'firebase/app';
import { useHistory } from 'react-router-dom';
import Loading from '../Loading';


const RequestForm = (props) => {
    const history = useHistory();
    const tutorID = props.match.params.tutorID;
    const submitTime = JSON.stringify(new Date());
    const [chosenDate, onChangeDate] = useState(new Date());
    const [subject, setSubject] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const setSubjectFunc = (e)=>{
        setSubject(e.target.value);
    }

    const handleSubmit = (e)=>{
        e.preventDefault();
        setIsLoading(true);
        const requestID = nanoid(12);
        let tutorObj, tuteemineObj;
        const firestore = firebase.firestore();
        //create 2 reuquest forms, one for your userDoc, and another for the other user's doc

        //add to your userDoc
         async function addToMine(){
             try{
              //collect the otherUser's object
                const receipt = await firestore.collection("tutors").doc(tutorID).get();
                tutorObj = receipt.data();
                //my request object
                const myObj = {
                    tutor: tutorObj,
                    requestID,
                    requestedDateTime: JSON.stringify(chosenDate),
                    subject,
                    link: "",
                    submitTime,
                    status: "pending"
                }

                //submit to my user object
                const submission = await firestore.collection("users").doc(props.userDoc.uid).update({
                    requests: firebase.firestore.FieldValue.arrayUnion(myObj)
                })
                setIsLoading(false);
                history.push('/');
             }catch(e){
                 console.log(e)
             }
         }
         

        //add to the otherUsers Doc

        async function addToTutors(){
            try{
            //collect our tutee object
            const receipt = await firestore.collection("tutees").doc(props.userDoc.uid).get();
            tuteemineObj = receipt.data();
                const theirObj = {
                    tutee: tuteemineObj,
                    requestID,
                    requestedDateTime: JSON.stringify(chosenDate),
                    subject,
                    link: "",
                    submitTime,
                    status: "pending"
                }

                const submission = await firestore.collection("users").doc(tutorID).update({
                    requests: firebase.firestore.FieldValue.arrayUnion(theirObj)
                });
            console.log(theirObj);
            addToMine()

            }catch(e){
                console.log(e)
            }
        }
        addToTutors();
    }

    

    return (
        <div className="screen">
            <div className="center-hrz">
                <h1 className="screen__header">Request a New Tutorial</h1>
            </div>

            
                <form onSubmit={handleSubmit}>
                    <div className="center-hrz--col requestForm">
                         <input type="text" placeholder="Enter Requested Subject" className="subject input-text" required id="subject" onChange={setSubjectFunc}/>
                          <label htmlFor="subject" className="input-label">Enter Requested Subject</label>
                             <br />
                          {/* <input type="text" placeholder="Credentials" className="credentials input-text" required id="credentials-1"/>
                          <label htmlFor="credentials-1" className="input-label">Credentials</label> */}
                          {/* <input type="date" id="date"/> */}
                          <div className="date-time-stamp-bg">
                            <DateTimePicker
                            onChange={onChangeDate}
                                value={chosenDate}
                                required={true}
                            />
                          </div>
                          <label htmlFor="date" className="input-label">Pick a date and time for the tutorial</label>
                          <br />
                          {
                              !isLoading ? 
                              <button type="submit" className="button button1">Submit</button> : 
                              <button className="buttonn buttonn--nohover"><Loading size="medium"/></button>
                          }
                           
                    </div>     
                </form>
            
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

export default connect(mapStateToProps, mapDispatchToProps)(RequestForm);
