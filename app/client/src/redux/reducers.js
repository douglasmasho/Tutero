import {persistReducer} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { firestoreReducer } from "redux-firestore"; //will help us sync the firestore with our aplication state.


const persistConfig  = {
    key: "root",
    storage,
    whiteList: ["userDetails", "userDoc"]
}


const countReducer = (state = 0, action)=>{
    switch(action.type){
        case "INCREMENT":
            return state + action.number
        case "DECREMENT": 
            return state - action.number
        default: //niks  
            return state           
    }
}



const authReducer = (state=false, action)=>{
    switch(action.type){
        case "SET_AUTH_STATUS": 
             return action.status
        default: 
             return state
    }
}

const userDetailsReducer = (state={}, action)=>{
    switch(action.type){
        case "SET_DETAILS": 
            return action.details 
        default: 
            return state
    }
}

const userDocReducer = (state={}, action)=>{
    switch(action.type){
        case "SET_USER_DOC": 
            return action.doc
        default: 
            return state
    }
}

const rootReducer = combineReducers({
    count: countReducer,
    firestore: firestoreReducer,
    authStatus: authReducer,
    userDetails: userDetailsReducer,
    userDoc: userDocReducer
})

export default persistReducer(persistConfig,rootReducer);
