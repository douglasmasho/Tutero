import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCsGd-oFmUb62kI5LQxXBSez54HfX3izWw",
    authDomain: "blabblev2.firebaseapp.com",
    projectId: "blabblev2",
    storageBucket: "blabblev2.appspot.com",
    messagingSenderId: "271112976283",
    appId: "1:271112976283:web:7cb01e0d4e77a3809dd33e",
    measurementId: "G-DHDDEJXQDF"
  };


  firebase.initializeApp(firebaseConfig);

  export default firebase