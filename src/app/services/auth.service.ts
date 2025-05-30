import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    colorblindMode: boolean;
    colorblindType: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    // Escuchar cambios en el estado de autenticación
    onAuthStateChanged(this.firebaseService.auth, (user) => {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(!!user);
      
      if (user) {
        this.updateLastLogin(user.uid);
      }
    });
  }

  // Método que devuelve Observable para compatibilidad
  login(email: string, password: string): Observable<void> {
    return from(this.loginAsync(email, password));
  }

  // Método que devuelve Observable para compatibilidad
  register(email: string, password: string, displayName?: string): Observable<void> {
    return from(this.registerAsync(email, password, displayName || ''));
  }

  // Método que devuelve Observable para compatibilidad
  logout(): Observable<void> {
    return from(this.logoutAsync());
  }

  // Método que devuelve Observable para compatibilidad
  resetPassword(email: string): Observable<void> {
    return from(this.resetPasswordAsync(email));
  }

  // Métodos internos async
  private async loginAsync(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.firebaseService.auth, email, password);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  private async registerAsync(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseService.auth, 
        email, 
        password
      );
      
      // Actualizar el perfil del usuario si se proporciona displayName
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Crear documento del usuario en Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          colorblindMode: false,
          colorblindType: 'normal'
        }
      };

      await setDoc(
        doc(this.firebaseService.db, 'users', userCredential.user.uid), 
        userProfile
      );

    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  private async logoutAsync(): Promise<void> {
    try {
      await signOut(this.firebaseService.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  private async resetPasswordAsync(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.firebaseService.auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(this.firebaseService.db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  async updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const userRef = doc(this.firebaseService.db, 'users', uid);
      await updateDoc(userRef, { 
        preferences: preferences,
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(this.firebaseService.db, 'users', uid);
      await updateDoc(userRef, { lastLogin: new Date() });
    } catch (error) {
      console.error('Error al actualizar último login:', error);
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'El email ya está en uso';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión';
      default:
        return 'Error de autenticación';
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}