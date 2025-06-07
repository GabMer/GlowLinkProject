<<<<<<< Updated upstream
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Room, RoomMessage } from "../models/light.model";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from "firebase/firestore";
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  private roomMessagesSubject = new BehaviorSubject<RoomMessage[]>([]);
  private isHostSubject = new BehaviorSubject<boolean>(false);

  public currentRoom$ = this.currentRoomSubject.asObservable();
  public roomMessages$ = this.roomMessagesSubject.asObservable();
  public isHost$ = this.isHostSubject.asObservable();

  private unsubscribeRoom: (() => void) | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  async createRoom(roomName: string): Promise<string> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuario no autenticado');

    const roomId = this.generateRoomCode();
    
    const room: Room = {
      id: roomId,
      name: roomName,
      hostId: currentUser.uid,
      hostName: currentUser.displayName || currentUser.email || 'Usuario',
      participants: [currentUser.uid],
      lightState: {},
      messages: [],
      createdAt: new Date(),
      isActive: true
    };

    try {
      await setDoc(doc(this.firebaseService.db, "rooms", roomId), {
        ...room,
        createdAt: serverTimestamp()
      });
      
      this.isHostSubject.next(true);
      this.subscribeToRoom(roomId);
      
      // Enviar mensaje de bienvenida
      await this.sendSystemMessage(roomId, `🎉 Sala "${roomName}" creada por ${room.hostName}`);
      
      return roomId;
    } catch (error) {
      console.error('Error al crear sala:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string): Promise<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Usuario no autenticado');

    try {
      const roomRef = doc(this.firebaseService.db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        throw new Error("La sala no existe");
      }

      const room = roomSnap.data() as Room;
      
      if (!room.isActive) {
        throw new Error("La sala no está activa");
      }

      // Verificar si ya está en la sala
      if (!room.participants.includes(currentUser.uid)) {
        await updateDoc(roomRef, {
          participants: arrayUnion(currentUser.uid)
        });
      }

      this.isHostSubject.next(room.hostId === currentUser.uid);
      this.subscribeToRoom(roomId);
      
      // Enviar mensaje de bienvenida
      const userName = currentUser.displayName || currentUser.email || 'Usuario';
      await this.sendSystemMessage(roomId, `👋 ${userName} se ha unido a la sala`);
      
      return true;
    } catch (error) {
      console.error("Error al unirse a la sala:", error);
      throw error;
    }
  }

  private subscribeToRoom(roomId: string): void {
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
    }

    const roomRef = doc(this.firebaseService.db, "rooms", roomId);
    this.unsubscribeRoom = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const room = doc.data() as Room;
        // Convertir timestamp de Firestore a Date
        if (room.createdAt && typeof room.createdAt !== 'object') {
          room.createdAt = new Date(room.createdAt);
        }
        this.currentRoomSubject.next(room);
        this.roomMessagesSubject.next(room.messages || []);
      }
    }, (error) => {
      console.error('Error en la suscripción a la sala:', error);
    });
  }

  async updateLightState(roomId: string, lightState: any): Promise<void> {
    if (!this.isHostSubject.getValue()) {
      throw new Error('Solo el anfitrión puede controlar las luces');
    }
    
    try {
      const roomRef = doc(this.firebaseService.db, "rooms", roomId);
      await updateDoc(roomRef, { 
        lightState,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar estado de luces:', error);
      throw error;
    }
  }

  async sendSystemMessage(roomId: string, text: string): Promise<void> {
    const message: RoomMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      type: 'system'
    };

    try {
      const roomRef = doc(this.firebaseService.db, "rooms", roomId);
      await updateDoc(roomRef, {
        messages: arrayUnion(message)
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    const currentRoom = this.currentRoomSubject.getValue();
    
    if (currentUser && currentRoom) {
      try {
        const roomRef = doc(this.firebaseService.db, "rooms", currentRoom.id);
        
        // Remover usuario de participantes
        await updateDoc(roomRef, {
          participants: arrayRemove(currentUser.uid)
        });

        // Enviar mensaje de despedida
        const userName = currentUser.displayName || currentUser.email || 'Usuario';
        await this.sendSystemMessage(currentRoom.id, `👋 ${userName} ha salido de la sala`);
        
      } catch (error) {
        console.error('Error al salir de la sala:', error);
      }
    }

    // Limpiar estado local
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }
    
    this.currentRoomSubject.next(null);
    this.roomMessagesSubject.next([]);
    this.isHostSubject.next(false);
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (!this.isHostSubject.getValue()) {
      throw new Error('Solo el anfitrión puede eliminar la sala');
    }
    
    try {
      await deleteDoc(doc(this.firebaseService.db, "rooms", roomId));
      await this.leaveRoom();
    } catch (error) {
      console.error('Error al eliminar sala:', error);
      throw error;
    }
  }

  async getRoomsByUser(): Promise<Room[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];

    try {
      const roomsRef = collection(this.firebaseService.db, "rooms");
      const q = query(
        roomsRef, 
        where("participants", "array-contains", currentUser.uid),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const rooms: Room[] = [];
      
      querySnapshot.forEach((doc) => {
        const room = doc.data() as Room;
        rooms.push(room);
      });
      
      return rooms;
    } catch (error) {
      console.error('Error al obtener salas:', error);
      return [];
    }
  }

  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateUserId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  getCurrentRoom(): Room | null {
    return this.currentRoomSubject.getValue();
  }

  isCurrentHost(): boolean {
    return this.isHostSubject.getValue();
  }
}
=======
import { Injectable } from "@angular/core"
import type { Room } from "../models/room.model"
import { v4 as uuidv4 } from "uuid"

@Injectable({ providedIn: "root" })
export class RoomService {
  private rooms: Room[] = []

  /** Crea y almacena una nueva sala. */
  createRoom(showType: "default" | "custom" | "music", creatorUid: string, presetId?: string): Room {
    const room: Room = {
      id: uuidv4(),
      creatorUid,
      showType,
      status: "waiting",
      text: "",
      textMode: "static",
      connectedUsers: [creatorUid],
      animationActive: false,
      createdAt: Date.now(),
      presetId: showType === "default" ? presetId : undefined,
    }

    // Verificar si ya existe una sala con el mismo ID (muy improbable pero por seguridad)
    const existingRoomIndex = this.rooms.findIndex((r) => r.id === room.id)
    if (existingRoomIndex >= 0) {
      this.rooms[existingRoomIndex] = room
    } else {
      this.rooms.push(room)
    }

    console.log(`Sala creada: ${room.id}, tipo: ${showType}, preset: ${presetId}`)
    return room
  }

  /** Devuelve la sala por su ID */
  getRoom(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id)
  }

  /** Devuelve todas las salas (para debugging) */
  getRooms(): Room[] {
    return this.rooms
  }

  /** Cambia el estado de la sala a 'active' cuando el anfitrión arranca el show */
  startRoom(roomId: string): boolean {
    const room = this.getRoom(roomId)
    if (!room) {
      console.error(`No se encontró la sala con ID: ${roomId}`)
      return false
    }

    room.status = "active"
    room.animationActive = true
    console.log(`Sala ${roomId} activada`)
    return true
  }

  /** Chequea si ya está en estado 'active' */
  isRoomStarted(roomId: string): boolean {
    const room = this.getRoom(roomId)
    if (!room) return false
    return room.status === "active"
  }
}
>>>>>>> Stashed changes
