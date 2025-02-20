// src/App.js

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import ThemeCustomization from './themes/ThemeCustomization';
import ScrollTop from './components/ScrollTop';
import AuthProvider from './providers/AuthProvider';
import { messaging } from './firebaseConfig';
import { getToken } from 'firebase/messaging';
function App() {
useEffect(()=>{
  generateFCMToken();
},[]);
  const generateFCMToken =()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
          .register('/firebase-messaging-sw.js') // Adjust the path as needed
          .then((registration) => {
            //  console.log('Service Worker registered with scope:', registration.scope);
              return registration;
          })
          .then(() => {
              // Firebase configuration
           //  console.log("working");
  
              // Initialize Firebase app
           
  
              // Request permission for push notifications
           Notification.requestPermission()
                  .then((permission) => {
                      if (permission === 'granted') {
                       //   console.log('Notification permission granted.');
                          return getToken(messaging, { vapidKey: 'BOTkjrtmLo6jK5Ro_3WtzFek-4SFgPdALfd37xZld_qPz7WZ2B72qoLXJRdDXkTwI9bVvb65AC4YQumfi1goyi4' });
                      } else {
                         // console.log('Notification permission denied.');
                      }
                  })
                  .then((token) => {
                      if (token) {
                        //  console.log('FCM Token:', token);
                          localStorage.setItem('notificationToken', token);
                          // Send the token to your server or store it as needed
                      } else {
                        //  console.log('No registration token available. Request permission to generate one.');
                      }
                  })
                  .catch((error) => {
                   //   console.error('Error during token generation:', error);
                  });
          })
          .catch((err) => {
             // console.error('Service Worker registration failed:', err);
          });
  }
  }
  return (
    <AuthProvider>
      <ThemeCustomization>
        <RouterProvider router={router}>
          <ScrollTop />
        </RouterProvider>
      </ThemeCustomization>
    </AuthProvider>
  );
}

export default App;
