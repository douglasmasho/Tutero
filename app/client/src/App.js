import React, {useState, useRef, useContext, useEffect} from 'react';
import Room from "./Components/Chat/Room";
import Account from './Components/Account';
import {connect} from "react-redux";      
import * as actionCreators from "./redux/actions";
import {bindActionCreators} from "redux";
import {compose} from "redux";
import {Route, Link, } from "react-router-dom";
import Home from './Components/Home';
import Subject from './Components/Dashboard/Subject';
import tuteroLogo  from "./assets/tutero.svg";
import BackIcon from "./assets/back.svg";
import MenuIcon from "./assets/menu.svg";
import Menu from "./Components/Menu";
import DirectMessages from './Components/Chat/DirectMessages';
import RequestForm from './Components/Request/RequestForm';
import Testt from './Components/Testt';
import CreateRoom from "./Components/CreateRoom";


function App(props) {
  const navRef = useRef(),
        navCloseRef = useRef(),
        dashboardRef = useRef();

        const linkClick =()=>{
          let currentLink = document.querySelector(".activeLink");
          if(currentLink){
              currentLink.classList.remove("activeLink")
          }
      }

       const closeNav =()=>{
          const nav = navRef.current; ///expand this;
          const menus = document.querySelectorAll(".menu--sub");///give these a display of block;
          // const bottomDiv = bottomDivRef.current//give this a display of block;
          const closeNav = navCloseRef.current;
          
          menus.forEach(e=>{
              e.style.display= "none";
          })
          // bottomDiv.style.display = "none";
          // bottomDiv.style.opacity = "0";
          nav.style.animation = "collapse 0.3s forwards";
          closeNav.style.display = "none";
      }

      const expandNav=()=>{
        const nav = navRef.current; ///expand this;
        const menus = document.querySelectorAll(".menu--sub");///give these a display of block;
        // const bottomDiv =this.bottomDivRef.current//give this a display of block;
        const closeNav = navCloseRef.current;

        menus.forEach(e=>{
            e.style.display= "block";
        })

        // bottomDiv.style.display = "block";
        // bottomDiv.style.opacity = "100%";

        nav.style.animation = "expand 0.4s forwards";
        closeNav.style.display = "block";
    }


      useEffect(()=>{
        let menuLinks = document.querySelectorAll(".menu--link");
        const x = window.matchMedia("(max-width: 600px)");

        //query function 
        let closeNavinQ = (x)=>{
            if(x.matches){
                menuLinks.forEach((e)=>{
                    e.addEventListener("click", closeNav);
                })
            }
        }

    //create the initial listener, runs when the app is started
    closeNavinQ(x);
    //create the listener for state change, that runs the query function on every state change
    x.addListener(closeNavinQ);
    x.addListener(()=>{
        window.location.reload();
    })
      },[])
  

  return (
    <>  
      <div className="home">
              {/* <Link to="/account">Go to account</Link> */}
              <div id="navigation" ref={navRef}>
                    <img src={BackIcon} alt="" className="nav--icon" id="nav--close" onClick={closeNav} ref={navCloseRef}/>
                      <Link to="/" onClick={linkClick}><img className="nav__logo" src={tuteroLogo} alt="logo"/></Link>
                      <Menu/>
                      {/* <BottomDiv ref={this.bottomDivRef} profile={this.props.profile}/> */}
                </div>
                <div id="dashboard">
                    <img src={MenuIcon} className="nav--icon" id="nav--open" alt="" onClick={expandNav}/>
                    <Route component={Room} exact path="/direct/:roomName"/>
                    <Route component={Account} exact path="/account"/>
                    <Route component={Home} exact path="/"/>
                    <Route component={Subject} exact path="/subject/:subject"/>
                    <Route component={DirectMessages} exact path="/directs"/>
                    <Route component={RequestForm} exact path="/request/:tutorID"/>
                    <Route component={CreateRoom} exact path="/createRoom"/>
                    {/* <Route component={Testt} exact path="/test"/> */}
                </div>

        </div> 
    </>
  );
}

const mapStateToProps = state=>({
  authStatus: state.authStatus,
  userDetails: state.userDetails,
  userDoc: state.userDoc
})

const mapDispatchToProps = dispatch=>{
  return bindActionCreators(actionCreators, dispatch)
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  // firestoreConnect(props=>[
  //   {collection: "Test"}
  // ])
)(App);
