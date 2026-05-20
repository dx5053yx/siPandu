# siPandu

MVP demo chatbot WhatsApp UMKM: Next.js + Firebase + Gemini + OpenClaw.


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAC9qpU9GnzisMbuijuJdFZaddXEZ5Ijgo",
  authDomain: "sipandu-45.firebaseapp.com",
  projectId: "sipandu-45",
  storageBucket: "sipandu-45.firebasestorage.app",
  messagingSenderId: "642616332039",
  appId: "1:642616332039:web:33968f391a5a82973f7fa2",
  measurementId: "G-YSY5EZ97DL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // This rule allows anyone with your Firestore database reference to view, edit,
    // and delete all data in your Firestore database. It is useful for getting
    // started, but it is configured to expire after 30 days because it
    // leaves your app open to attackers. At that time, all client
    // requests to your Firestore database will be denied.
    //
    // Make sure to write security rules for your app before that time, or else
    // all client requests to your Firestore database will be denied until you Update
    // your rules
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 6, 19);
    }
  }
}