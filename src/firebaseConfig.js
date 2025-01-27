// src/firebaseConfig.js

// Import the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyCA6wNMW-i3umrXju-CIGoD_CVMEiJim5A",
    authDomain: "sisya-classes-79387.firebaseapp.com",
    projectId: "sisya-classes-79387",
    storageBucket: "sisya-classes-79387.firebasestorage.app",
    messagingSenderId: "86447716958",
    appId: "1:86447716958:web:4aaf324039c13b624092cf",
    measurementId: "G-R7GTNVT5B8"
  };


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
export const messaging = getMessaging(app);


