importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyCA6wNMW-i3umrXju-CIGoD_CVMEiJim5A",
    authDomain: "sisya-classes-79387.firebaseapp.com",
    projectId: "sisya-classes-79387",
    storageBucket: "sisya-classes-79387.firebasestorage.app",
    messagingSenderId: "86447716958",
    appId: "1:86447716958:web:4aaf324039c13b624092cf",
    measurementId: "G-R7GTNVT5B8"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});