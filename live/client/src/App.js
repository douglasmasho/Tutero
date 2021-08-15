import React from 'react';
import {Route} from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import "./sass/main.scss";
import "./sass/styles.css";
import SocketContextProvider from './Context/socketContext';
import SimpleBar from 'simplebar-react';
// import 'simplebar/dist/simplebar.min.css';
function App() {
  return (
    <SocketContextProvider>
          <div>    
              <Route exact path="/" render={({history})=>(
              <div>
                  <CreateRoom history={history}/>
                
              </div>
            
              )}/>

              <Route exact path="/room/:roomID" render={(routeArgs)=>(
                <Room routeArgs={routeArgs}/>
              )}/>

          </div>
    </SocketContextProvider>


  );
}

export default App;
