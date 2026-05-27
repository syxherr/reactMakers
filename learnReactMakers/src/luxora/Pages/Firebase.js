import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChsuoWdNvsAeHhD2BuzazCq2D_HA6XZWc",
  authDomain: "luxora-196cc.firebaseapp.com",
  projectId: "luxora-196cc",
  storageBucket: "luxora-196cc.firebasestorage.app",
  messagingSenderId: "500321430713",
  appId: "1:500321430713:web:94961b7ba15a909449bf68",
  measurementId: "G-KGB561TX7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);