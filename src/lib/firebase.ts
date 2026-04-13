import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyA8pAgIfzI0AWsXIgooDF3tAuw1UuA7BV4",
  authDomain: "hackthegap-c34fd.firebaseapp.com",
  projectId: "hackthegap-c34fd",
  storageBucket: "hackthegap-c34fd.firebasestorage.app",
  messagingSenderId: "164734447292",
  appId: "1:164734447292:web:02943f626d971d8884eab9",
  measurementId: "G-D0T2QKZ67V"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
export default app