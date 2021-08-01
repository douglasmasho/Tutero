////PLEASE DO NOT DELETE ANYTHING, YOU CAN ONLY ADD......
///IE. DO NOT DELETE THE CLASSNAMES I GAVE, IF YOU WANT TO ADD A CLASS FOR STYLING PURPOSES, JUST ADD TO THE LIST
//nest inputs and their respective labels in devs....to seperate them and give them margins
import React, {useState, useEffect, useRef} from 'react';
import firebase from 'firebase/app';
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import {compose} from "redux";
import {connect} from "react-redux";      
import * as actionCreators from "../redux/actions";
import {bindActionCreators} from "redux";
import AccountDetails from './AccountDetails';
import { useHistory } from 'react-router-dom';


const Account = (props) => {
    const [type, setType] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [rate, setRate] = useState(0);
    const errorRefTutee = useRef();
    const errorRefTutorCats = useRef();
    const errorRefTutorLevels = useRef();
    const errorRefTuteeEdLEvel = useRef();
    const history = useHistory();


    const   uiConfig = {
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID 
      ],
      callbacks: {
        signInSuccess: () => false
      }
    }


    const handleChange = (e)=>{
        if(e.target.classList.contains("name")){
          setDisplayName(e.target.value)
        }
      }
    
      const handleClick = (e)=>{
        if(e.target.type === "radio"){
          setEducationLevel(e.target.id);
        }
      }

      const signOut = ()=>{
        console.log("supposed to be signing out")
        firebase.auth().signOut()
      }

      const onSubmit = (e)=>{
        e.preventDefault();
        if(type === "tutee"){
          const checkBoxes = document.querySelectorAll(".tuteeSubs");
          const subs = [];
          checkBoxes.forEach(el=> {
            if(el.checked) subs.push(el.id)
          });

         if(educationLevel === ""){
            errorRefTuteeEdLEvel.current.style.display = "block";
            setTimeout(()=>{
              errorRefTuteeEdLEvel.current.style.display = "none";
            }, 3000)
          } else if(subs.length === 0){
            errorRefTutee.current.style.display = "block";
            setTimeout(()=>{
              errorRefTutee.current.style.display = "none";
            }, 3000)
          }
          else{
            const userObj = {
              type: "tutee",
              name: displayName,
              educationLevel,
              subjects: subs,
              photoURL: props.userDetails.photoURL,
              uid: props.userDetails.uid,
              favorites: [],
              dms: [],
              requests: [],
            }

            //create a user document and tutee document in firestore

            async function create(){
              const firestore = firebase.firestore();
              try{
                const userCreation = await firestore.collection("users").doc(props.userDetails.uid).set(userObj);
                const tuteeCreation = await firestore.collection("tutees").doc(props.userDetails.uid).set(userObj);
                //redirect to the chat page
                history.push("/");
              }
              catch(e){
                console.log(e)
              }
            }

            create()
          }
        }
        else if(type === "tutor"){
          const credInputs = document.querySelectorAll(".credentials");
          const credentials = []
          credInputs.forEach(el=> {if(el.value !== "")credentials.push(el.value)});

          const specSubInputs = document.querySelectorAll(".specific-sub");
          const specSubs = [];
          specSubInputs.forEach(el=>{if(el.value !== "")specSubs.push(el.value)});

          const categoryInput = document.querySelectorAll(".tutorSubs");
          const categories = [];
          categoryInput.forEach(el=>{if(el.checked)categories.push(el.value)});


          const levelsInput = document.querySelectorAll(".tutorLevels");
          const levels = [];
          levelsInput.forEach(el=>{if(el.checked)levels.push(el.value)});

          if(categories.length === 0){ 

            errorRefTutorCats.current.style.display = "block";
            setTimeout(()=>{
              errorRefTutorCats.current.style.display = "none";
            }, 3000)
            const element = document.querySelector("#scrollhere");
            console.log(element)
              const y = element.getBoundingClientRect().top + window.scrollY;
              window.scroll({
                top: "10px",
                behavior: 'smooth'
              });
          }else if(levels.length === 0){



            errorRefTutorLevels.current.style.display = "block";
            setTimeout(()=>{
              errorRefTutorLevels.current.style.display = "none";
            }, 3000)
          }else{

            const userObj = {
              type: "tutor",
              name: displayName,
              photoURL: props.userDetails.photoURL,
              categories,
              levels,
              specSubs,
              credentials,
              rate,
              uid: props.userDetails.uid,
              dms: [],
              requests: [],
              rating: [],
            }

            async function create(){
              const firestore = firebase.firestore();
              try{
                const userCreation = await firestore.collection("users").doc(props.userDetails.uid).set(userObj);
                const tuteeCreation = await firestore.collection("tutors").doc(props.userDetails.uid).set(userObj);
                history.push("/");
                //redirect to the chat page
              }
              catch(e){
                console.log(e)
              }
            }

          create();       
          }

          

          //create a seperate field within the doc which is an array that contains the categories

          
        }
      }

      useEffect(()=>{
        firebase.auth().onAuthStateChanged(user=>{
          props.setAuthStatus(!!user);
          if(user){
            props.setUserDetails(user);
            //get the user document from firebase and give it to redux
            const firestore = firebase.firestore();
            
            async function getUserDoc(){
              try{
                const docSnapshot = await firestore.collection("users").doc(user.uid).get();
                console.log(docSnapshot.data());
                if(docSnapshot.exists){
                props.setUserDoc(docSnapshot.data());
              }else{
                props.setUserDoc({});
              }

              }catch(e){
                console.log(e)
              }
            }
            getUserDoc();

          }else{
            props.setUserDetails({});
            props.setUserDoc({});
          }
        })
      },[])

      useEffect(()=>{
        console.log(props.userDoc);
      })


    return (
      <div className="screen">
              <div className="center-hrz">
                <div className="welcome" >
          {
             props.authStatus && props.userDetails !== {} ?
             <>
             <h1 className="google"><span style={{color:"#0000FF"}}>G</span><span style={{color:"#FF0000"}}>o</span>
             <span style={{color:"#FFD700"}}>o</span><span style={{color:"#0000FF"}}>g</span><span style={{color:"#00FF00"}}>l</span>
             <span style={{color:"#FF0000"}}>e</span> Account:</h1>
             <p style={{fontSize:"20px", fontWeight: "bold"}}>Welcome {props.userDetails.displayName}</p>
                <button className="button1 button" onClick={signOut}>Sign out</button>
             {
               !props.userDoc.hasOwnProperty("type") ? 
               
               <>
                   {/* form starts here👇 */}
                   <div>


                  
                  {
                    type === "" ?
                    
                      <>
                   <p style={{fontSize:"20px", fontWeight: "bold"}}>What would you like to sign up for?</p>

                      <button className="button2 button" style={{marginRight: "10px"}} onClick={()=>{
                        setType("tutor")
                      }}>Sign up as a tutor</button>
                      <button style={{marginLeft: "10px"}}className="button2 button" onClick={()=>{
                        setType("tutee")
                      }}>Sign up as a tutee</button>
                      </>
                      :        
                    (type === "tutee" ?
                    <div>
                      <button className="button button2" onClick={()=>{
                        setType("tutor")
                      }}>Tutor</button>
                    <h2 className="text-size">Tutee Form</h2>
                       <form id="tuteeForm" onSubmit={onSubmit}>
                         <div className="center-hrz u-margin-top">
                          <div className="input-group ">
                            <input type="text" placeholder="Enter Display Name" required id="nameTutee" onChange={handleChange} className="name input-text" required/>
                              <label htmlFor="nameTutee" className="input-label">Enter Display Name</label>   
                              <br />
                          </div>

                         </div>

                          
                           <p className="text-size">Please enter your current education level/grade</p>

                             <br />
                             <div className="row">
                                <input type="radio" id="gr-10" name="level" className="tuteeLevels radio" onClick={handleClick}/>
                                <label htmlFor="gr-10" className="radio-label">Grade 10</label>
                                
                                <input type="radio" id="gr-11" name="level"  className="tuteeLevels radio" onClick={handleClick}/>
                                <label htmlFor="gr-11" className="radio-label">Grade 11</label>
                                  
                                  <input type="radio" id="gr-12" name="level"  className="tuteeLevels radio" onClick={handleClick}/>
                                <label htmlFor="gr-12" className="radio-label">Grade 12</label>
                                
                                <input type="radio" id="tertiary-under" name="level"  className="tuteeLevels radio" onClick={handleClick}/>
                                <label htmlFor="tertiary-under" className="radio-label">Tertiary Undergrad</label>
                                
                                <input type="radio" id="tertiary-post" name="level"  className="tuteeLevels radio" onClick={handleClick}/>
                                <label htmlFor="tertiary-post" className="radio-label">Tertiary Postgrad</label>
                             </div>
                             <p className="red-text" ref={errorRefTuteeEdLEvel} style={{display: "none"}}>Please select one of these options</p>
                            
                           <br />
                           <p className="text-size">Select the Subject Categories you are interested in</p>
                           <div>
                             <div className="grid grid-3">
                                  <div className="checkbox">
                                            <p className="text-size">Mathematics</p>
                                            <input type="checkbox" id="maths" className="tuteeSubs input-checkbox " value="maths" style={{display: "none"}}/>
                                            <label htmlFor="maths" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>
                                        <div className="checkbox">
                                            <p className="text-size">English</p>
                                            <input type="checkbox" id="english" className="tuteeSubs input-checkbox" value="english" style={{display: "none"}}/>
                                            <label htmlFor="english" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>

                                        <div className="checkbox">
                                            <p className="text-size">Accounting</p>
                                            <input type="checkbox" id="accounting" className="tuteeSubs input-checkbox" value="accounting" style={{display: "none"}}/>
                                            <label htmlFor="accounting" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>

                                        <div className="checkbox">
                                            <p className="text-size">Science</p>
                                            <input type="checkbox" id="science" className="tuteeSubs input-checkbox" value="science" style={{display: "none"}}/>
                                            <label htmlFor="science" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>

                                        <div className="checkbox">
                                            <p className="text-size">Economics</p>
                                            <input type="checkbox" id="economics" className="tuteeSubs input-checkbox" value="economics" style={{display: "none"}}/>
                                            <label htmlFor="economics" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>

                                        <div className="checkbox">
                                            <p className="text-size">Afrikaans</p>
                                            <input type="checkbox" id="afrikaans" className="tuteeSubs input-checkbox" value="afrikaans" style={{display: "none"}}/>
                                            <label htmlFor="afrikaans" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                        </div>

                             </div>

                                     
                               {/* you can give this p a class, but do not remove the style i gave it, it is crucial 👇 */}
                               <p className="red-text" ref={errorRefTutee} style={{display: "none"}}>Please select one of these options</p>
                           </div>
                           <br />
                           <button  className="button button2"type="submit">Submit</button>
                       </form>
                    </div>
                      :
                      <div>
                      <button className="button button2" onClick={()=>{
                    setType("tutee")
                  }}>Tutee</button>

                      <h2 className="text-size">Tutor Form</h2>
                      <form id="tutorForm" onSubmit={onSubmit}className="u-margin-top">
                          <input type="text" placeholder="Enter Display Name" required id="nameTutor" onChange={handleChange} className="name input-text" required/>
                          <label htmlFor="nameTutor" className="input-label ">Enter Display Name</label>
                          <br />
                          <br />
                          <input type="text" placeholder="Credentials *" className="credentials input-text" onChange={handleChange} required id="credentials-1"/>
                          <label htmlFor="credentials-1" className="input-label">Credentials *</label>
                          <input type="text" placeholder="Credentials (Optional)" className="credentials input-text" onChange={handleChange} id="credentials-2"/>
                          <label htmlFor="credentials-2" className="input-label">Credentials (Optional)</label>
                          <input type="text" placeholder="Credentials (Optional)" className="credentials input-text" onChange={handleChange} id="credentials-3"/>
                          <label htmlFor="credentials-3" className="input-label">Credentials (Optional)</label>
                          <br />
                          <br />
                              <input type="text" placeholder="Enter Specific Subject *" className="specific-sub input-text" onChange={handleChange} required id="sub-1"/>
                              <label htmlFor="sub-1" className="input-label">Enter Specific Subject *</label>
                              <input type="text" placeholder="Enter Specific Subject (Optional)" className="specific-sub input-text" onChange={handleChange} id="sub-2"/>
                              <label htmlFor="sub-2" className="input-label">Enter Specific Subject (Optional)</label>
                              <input type="text" placeholder="Enter Specific Subject (Optional)" className="specific-sub input-text" onChange={handleChange} id="sub-3"/>
                              <label htmlFor="sub-3" className="input-label">Enter Specific Subject (Optional)</label>
                          <br />
                          <p className="text-size">Select the Subject Categories you would like to be listed under</p>
                          <div className="center-hrz">
                            <div className="grid grid-3">

                                <div className="checkbox input-checkbox">
                                  <p className="text-size-subs">Mathematics</p>
                                  <input type="checkbox" id="maths" className="tutorSubs input-checkbox" onChange={handleChange} value="maths" style={{display: "none"}}/>
                                  <label htmlFor="maths" className="input-checkbox-label"><span className="input-checkbox-button"></span></label>
                                </div>

                                <div className="checkbox">
                                  <p className="text-size-subs">English</p>
                                  <input type="checkbox" id="english" className="tutorSubs input-checkbox" value="english" style={{display: "none"}}/>
                                  <label htmlFor="english" className="input-checkbox-label"><span className="input-checkbox-button"></span></label>
                                </div>

                                <div className="checkbox">
                                <p className="text-size-subs">Accounting</p>
                                  <input type="checkbox" id="accounting" className="tutorSubs input-checkbox" style={{display: "none"}} value="accounting"/>
                                  <label htmlFor="accounting" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                </div>
                                
                                <div className="checkbox">
                                  <p className="text-size-subs">Science</p>
                                  <input type="checkbox" id="science" className="tutorSubs input-checkbox" style={{display: "none"}} value="science"/>
                                  <label htmlFor="science" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                </div>

                                <div className="checkbox">
                                  <p className="text-size-subs">Economics</p>
                                  <input type="checkbox" id="economics" className="tutorSubs input-checkbox" value="economics" style={{display: "none"}}/>
                                  <label htmlFor="economics" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                </div>
                                <div className="checkbox">
                                  <p className="text-size-subs">Afrikaans</p>
                                  <input type="checkbox" id="afrikaans" className="tutorSubs input-checkbox" value="afrikaans" style={{display: "none"}}/>
                                  <label htmlFor="afrikaans" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                                </div>
                            </div>       
                          </div>
                          <div id="scrollhere">
                          </div>

                          <br />
                          <br />
                           {/* This is Jesse's checkbox */}
                          <p className="text-size">What levels do you tutor?</p>
                          <div className="center-hrz">
                            <div className="grid grid-3">
                              <div className="checkbox">
                                      <p className="text-size-levels">Grade 10</p>
                                      <input type="checkbox" id="gr-10" className="tutorLevels input-checkbox" value="gr-10" style={{display: "none"}}/>
                                      <label htmlFor="gr-10" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                              </div>
                              <div className="checkbox">
                                      <p className="text-size-levels">Grade 11</p>
                                      <input type="checkbox" id="gr-11" className="tutorLevels input-checkbox" value="gr-11" style={{display: "none"}}/>
                                      <label htmlFor="gr-11" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                              </div>
                              <div className="checkbox">
                                      <p className="text-size-levels">Grade 12</p>
                                      <input type="checkbox" id="gr-12" className="tutorLevels input-checkbox" value="gr-12" style={{display: "none"}}/>
                                      <label htmlFor="gr-12" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                              </div>
                              <div className="checkbox">
                                      <p className="text-size-levels">Tertiary Undergrad</p>
                                      <input type="checkbox" id="tertiary-under" className="tutorLevels input-checkbox" value="tertiary-under" style={{display: "none"}}/>
                                      <label htmlFor="tertiary-under" className="input-checkbox-label"><span className="input-checkbox-button"></span></label> 
                              </div>
                              <div className="checkbox">
                                      <p className="text-size-levels">Tertiary Postgrad</p>
                                      <input type="checkbox" id="tertiary-post" className="tutorLevels input-checkbox" value="tertiary-post" style={{display: "none"}}/>
                                      <label htmlFor="tertiary-post" className="input-checkbox-label"><span className="input-checkbox-button"></span></label>
                              </div>
                            </div>
                              
                            
      
                          </div>
                          {/* This is Douglas' checkbox 
                          <p className="text-size">What levels do you tutor?</p>
                              <input type="checkbox" id="gr-10" value="gr-10" className="tutorLevels input-checkbox"/>
                              <label className="text-size" htmlFor="gr-10">Grade 10</label>
                              <br />
                              <input type="checkbox" id="gr-11" value="gr-11" className="tutorLevels"/>
                              <label className="text-size" htmlFor="gr-11">Grade 11</label>
                              <br />
                               <input className="text-size" type="checkbox" id="gr-12" value="gr-12" className="tutorLevels"/>
                              <label className="text-size" htmlFor="gr-12">Grade 12</label>
                              <br />
                              <input className="text-size" type="checkbox" id="tertiary-under" value="tertiary-under" className="tutorLevels"/>
                              <label className="text-size" htmlFor="tertiary-under">Tertiary Undergrad</label>
                              <br />
                              <input type="checkbox" id="tertiary-post" value="tertiary-post" className="tutorLevels"/> 
                              <label className="text-size" htmlFor="tertiary-post">Tertiary Postgrad</label><br /> */}
                              <p className="red-text" ref={errorRefTutorLevels} style={{display: "none"}}>Please select at least one level to tutor</p> 
                            <p className="red-text" ref={errorRefTutorCats} style={{display: "none"}}>Please select at least one category you would like to be listed under</p>
                              
                              <br />
                              <br />
                          <input className="input-text" type="number" placeholder="Enter rate per hour (NAD)(subject to a 10% commission for Tutero)" onChange={(e)=>setRate(e.target.value)} required/>
                          <br />
                          <button className="button button2" type="submit">Submit</button>
                          
                      </form>
                    </div>) 
                   }

                  <br />
                  <br />
                {/* <button onClick={testPlus}>Increment</button>
                <button onClick={testMinus}>Decrement</button> */}
                </div>          
               </> : 
               <AccountDetails userDoc={props.userDoc}/>
             }
             </> : <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>       
          }

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

export default connect(mapStateToProps, mapDispatchToProps)(Account);
