import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SocketContextProvider from './Context/SocketContext';
import {BrowserRouter, Route} from "react-router-dom";
import Room from "./Components/Chat/Room"
import UIDContextProvider from './Context/UIDContext';
import "./sass/main.scss";
import {createStore, applyMiddleware, compose} from "redux";
import rootReducer from "./redux/reducers";
import {Provider} from "react-redux";
import {persistStore} from "redux-persist"; 
import {createFirestoreInstance} from "redux-firestore";//interact with firestore
import {ReactReduxFirebaseProvider} from "react-redux-firebase"; //interact with firebase
import fbConfig from "./config/fbConfig";
import firebase from 'firebase/app';
import 'firebase/firestore'
import Account from './Components/Account';
import { PersistGate } from 'redux-persist/integration/react';


//create the store==>state will be stored here
let store = createStore(rootReducer);

const persistor = persistStore(store)
  const profileProps = {
    useFirestoreForProfile: true,
    userProfile: "users"
}

  const rrfProps = {
    firebase,
    config: profileProps,
    dispatch: store.dispatch,
    createFirestoreInstance
  };



ReactDOM.render(
      <Provider store={store}>   
       <PersistGate persistor={persistor}>
        <ReactReduxFirebaseProvider {...rrfProps}>
                <BrowserRouter>
                  <SocketContextProvider>
                    <UIDContextProvider>
                        <App/>
                    </UIDContextProvider>
                  </SocketContextProvider>
                </BrowserRouter>
          </ReactReduxFirebaseProvider>
       </PersistGate>
        
    </Provider>
  , document.getElementById('root')
);