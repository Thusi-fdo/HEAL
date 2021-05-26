import * as firebase from 'firebase';
const firebaseConfig = {
  apiKey: "AIzaSyDIZ0WI43H6rpmGPmmt9qn7i1iGEMBac_Y",
  authDomain: "heal-bf119.firebaseapp.com",
  databaseURL: "https://heal-bf119-default-rtdb.firebaseio.com",
  projectId: "heal-bf119",
  storageBucket: "heal-bf119.appspot.com",
  messagingSenderId: "117164639068",
  appId: "1:117164639068:web:dd53f4496f53d02dec3799",
  measurementId: "G-R3RM5XL7M2"
};

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  export const db=app.database();