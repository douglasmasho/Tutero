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
                  {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, aliquam cum voluptatibus sint quos necessitatibus fuga praesentium natus sed blanditiis accusamus, tenetur impedit laudantium aspernatur dolorem obcaecati, accusantium totam reprehenderit! */}
              </div>
            
              )}/>

              <Route exact path="/room/:roomID" render={(routeArgs)=>(
                <Room routeArgs={routeArgs}/>
              )}/>

              <Route exact path="//" render={({history})=>(
              <div>
                  <CreateRoom history={history}/>
                  {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, aliquam cum voluptatibus sint quos necessitatibus fuga praesentium natus sed blanditiis accusamus, tenetur impedit laudantium aspernatur dolorem obcaecati, accusantium totam reprehenderit! */}
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
