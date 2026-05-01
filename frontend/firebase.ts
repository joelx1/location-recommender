import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADkPZEDOn8EZsBzdin2X2Zzy7waRAtQZs",
  authDomain: "placemark-ffb41.firebaseapp.com",
  projectId: "placemark-ffb41",
  storageBucket: "placemark-ffb41.firebasestorage.app",
  messagingSenderId: "168718339985",
  appId: "1:168718339985:web:ee61b584a6c5e4fd1d1430",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
