import { Injectable } from "@angular/core"
import { BehaviorSubject, from, type Observable } from "rxjs"
import { map } from "rxjs/operators"
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from "firebase/auth"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYQqxO5rdy0ZDgV3QPhX9FpT5WByokVdw",
  authDomain: "glowlink-88e73.firebaseapp.com",
  projectId: "glowlink-88e73",
  storageBucket: "glowlink-88e73.firebasestorage.app",
  messagingSenderId: "739847800706",
  appId: "1:739847800706:web:a189add21c58c9229e719b",
  measurementId: "G-1H53FYY1NW"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  public isAuthenticated$ = this.currentUser$.pipe(map((user) => !!user))

  constructor() {
    // Observar cambios en el estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user)
    })
  }

  /**
   * Registrar un nuevo usuario con email y contraseña
   */
  register(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      map((userCredential) => userCredential.user),
    )
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(map((userCredential) => userCredential.user))
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<void> {
    return from(signOut(auth))
  }

  /**
   * Enviar email para restablecer contraseña
   */
  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(auth, email))
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return auth.currentUser
  }
}

