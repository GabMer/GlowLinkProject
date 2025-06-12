import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Configuración de Firebase (usa la misma que en auth.service.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBYQqxO5rdy0ZDgV3QPhX9FpT5WByokVdw",
  authDomain: "glowlink-88e73.firebaseapp.com",
  projectId: "glowlink-88e73",
  storageBucket: "glowlink-88e73.firebasestorage.app",
  messagingSenderId: "739847800706",
  appId: "1:739847800706:web:a189add21c58c9229e719b",
  measurementId: "G-1H53FYY1NW",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export interface Room {
  id: string
  name: string
  createdBy: string
  createdAt: any
  isActive: boolean
  currentTrack?: {
    id: string
    title: string
    artist: string
    source: string
    type: string
    position: number
  }
  currentPreset?: {
    id: number
    name: string
    colors: string[]
  }
  participants: {
    id: string
    name: string
    isHost: boolean
  }[]
  settings: {
    isPrivate: boolean
    password?: string
    allowGuestControl: boolean
  }
}

@Injectable({
  providedIn: "root",
})
export class FirebaseRoomService {
  private currentRoomSubject = new BehaviorSubject<Room | null>(null)
  public currentRoom$ = this.currentRoomSubject.asObservable()

  private roomsSubject = new BehaviorSubject<Room[]>([])
  public rooms$ = this.roomsSubject.asObservable()

  private unsubscribeRoom: (() => void) | null = null

  constructor() {}

  /**
   * Crea una nueva sala
   */
  async createRoom(name: string, isPrivate = false, password?: string): Promise<string> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Generar un código único para la sala
      const roomId = this.generateRoomCode()

      // Crear la sala en Firestore
      const roomRef = doc(db, "rooms", roomId)
      const roomData: Room = {
        id: roomId,
        name: name,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isActive: true,
        participants: [
          {
            id: user.uid,
            name: user.displayName || user.email || "Usuario",
            isHost: true,
          },
        ],
        settings: {
          isPrivate: isPrivate,
          password: password,
          allowGuestControl: true,
        },
      }

      await setDoc(roomRef, roomData)

      // Suscribirse a los cambios de la sala
      this.subscribeToRoom(roomId)

      return roomId
    } catch (error) {
      console.error("Error al crear sala:", error)
      throw error
    }
  }

  /**
   * Genera un código único para la sala
   */
  private generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Se une a una sala existente
   */
  async joinRoom(roomId: string, password?: string): Promise<boolean> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Verificar si la sala existe
      const roomRef = doc(db, "rooms", roomId)
      const roomSnap = await getDoc(roomRef)

      if (!roomSnap.exists()) {
        throw new Error("La sala no existe")
      }

      const roomData = roomSnap.data() as Room

      // Verificar si la sala es privada y requiere contraseña
      if (roomData.settings.isPrivate && roomData.settings.password !== password) {
        throw new Error("Contraseña incorrecta")
      }

      // Verificar si el usuario ya está en la sala
      const isParticipant = roomData.participants.some((p) => p.id === user.uid)
      if (!isParticipant) {
        // Añadir al usuario como participante
        await updateDoc(roomRef, {
          participants: [
            ...roomData.participants,
            {
              id: user.uid,
              name: user.displayName || user.email || "Usuario",
              isHost: false,
            },
          ],
        })
      }

      // Suscribirse a los cambios de la sala
      this.subscribeToRoom(roomId)

      return true
    } catch (error) {
      console.error("Error al unirse a la sala:", error)
      return false
    }
  }

  /**
   * Se suscribe a los cambios de una sala
   */
  private subscribeToRoom(roomId: string): void {
    // Cancelar suscripción anterior si existe
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom()
    }

    const roomRef = doc(db, "rooms", roomId)
    this.unsubscribeRoom = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const roomData = doc.data() as Room
        this.currentRoomSubject.next(roomData)
      } else {
        this.currentRoomSubject.next(null)
      }
    })
  }

  /**
   * Abandona la sala actual
   */
  async leaveRoom(): Promise<void> {
    try {
      const currentRoom = this.currentRoomSubject.getValue()
      const user = auth.currentUser

      if (!currentRoom || !user) return

      // Obtener la sala actualizada
      const roomRef = doc(db, "rooms", currentRoom.id)
      const roomSnap = await getDoc(roomRef)

      if (!roomSnap.exists()) return

      const roomData = roomSnap.data() as Room

      // Verificar si el usuario es el host
      const isHost = roomData.participants.find((p) => p.id === user.uid)?.isHost

      if (isHost) {
        // Si es el host, cerrar la sala
        await updateDoc(roomRef, {
          isActive: false,
        })
      } else {
        // Si no es el host, solo remover de participantes
        const updatedParticipants = roomData.participants.filter((p) => p.id !== user.uid)
        await updateDoc(roomRef, {
          participants: updatedParticipants,
        })
      }

      // Cancelar suscripción
      if (this.unsubscribeRoom) {
        this.unsubscribeRoom()
        this.unsubscribeRoom = null
      }

      this.currentRoomSubject.next(null)
    } catch (error) {
      console.error("Error al abandonar sala:", error)
    }
  }

  /**
   * Actualiza la pista actual de la sala
   */
  async updateCurrentTrack(track: any): Promise<void> {
    try {
      const currentRoom = this.currentRoomSubject.getValue()
      if (!currentRoom) return

      const roomRef = doc(db, "rooms", currentRoom.id)
      await updateDoc(roomRef, {
        currentTrack: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          source: track.source,
          type: track.type,
          position: 0,
        },
      })
    } catch (error) {
      console.error("Error al actualizar pista:", error)
    }
  }

  /**
   * Actualiza el preset actual de la sala
   */
  async updateCurrentPreset(preset: any): Promise<void> {
    try {
      const currentRoom = this.currentRoomSubject.getValue()
      if (!currentRoom) return

      const roomRef = doc(db, "rooms", currentRoom.id)
      await updateDoc(roomRef, {
        currentPreset: {
          id: preset.id,
          name: preset.name,
          colors: preset.colors,
        },
      })
    } catch (error) {
      console.error("Error al actualizar preset:", error)
    }
  }

  /**
   * Obtiene la sala actual
   */
  getCurrentRoom(): Room | null {
    return this.currentRoomSubject.getValue()
  }

  /**
   * Verifica si el usuario actual es el host
   */
  isCurrentUserHost(): boolean {
    const currentRoom = this.currentRoomSubject.getValue()
    const user = auth.currentUser

    if (!currentRoom || !user) return false

    return currentRoom.participants.some((p) => p.id === user.uid && p.isHost)
  }

  /**
   * Busca salas públicas
   */
  async searchPublicRooms(): Promise<Room[]> {
    try {
      const roomsRef = collection(db, "rooms")
      const q = query(roomsRef, where("settings.isPrivate", "==", false), where("isActive", "==", true))

      const querySnapshot = await getDocs(q)
      const rooms: Room[] = []

      querySnapshot.forEach((doc) => {
        rooms.push(doc.data() as Room)
      })

      this.roomsSubject.next(rooms)
      return rooms
    } catch (error) {
      console.error("Error al buscar salas:", error)
      return []
    }
  }
}
