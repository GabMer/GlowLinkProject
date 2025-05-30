import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBYQqxO5rdy0ZDgV3QPhX9FpT5WByokVdw",
  authDomain: "glowlink-88e73.firebaseapp.com",
  projectId: "glowlink-88e73",
  storageBucket: "glowlink-88e73.firebasestorage.app",
  messagingSenderId: "739847800706",
  appId: "1:739847800706:web:a189add21c58c9229e719b",
  measurementId: "G-1H53FYY1NW"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(firebaseConfig);
  public db = getFirestore(this.app);
  public auth = getAuth(this.app);

  constructor() {}
}