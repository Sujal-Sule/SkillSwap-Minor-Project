// src/firebaseConfig.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAYxN8uHOy3184JSRAbnrOeZcI7VIEeaCE",
  authDomain: "skill-swap-fb2c1.firebaseapp.com",
  databaseURL: "https://skill-swap-fb2c1-default-rtdb.firebaseio.com",
  projectId: "skill-swap-fb2c1",
  storageBucket: "skill-swap-fb2c1.appspot.com",
  messagingSenderId: "373693698006",
  appId: "1:373693698006:web:3d8191e52fcb0b8ae35e77",
  measurementId: "G-JNWQ11ZJG6"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

export function initFirebaseOnce() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    console.log('Firebase initialized (local module).');
  }
  return { app, auth: auth!, provider: provider! };
}

export function getAuthInstance() {
  if (!auth) initFirebaseOnce();
  return auth!;
}

export function getGoogleProvider() {
  if (!provider) initFirebaseOnce();
  return provider!;
}
