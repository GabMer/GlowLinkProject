import { Injectable } from "@angular/core";
import { Room } from "../models/room.model";
import { v4 as uuidv4 } from "uuid";

@Injectable({ providedIn: "root" })
export class RoomService {
  private rooms: Room[] = [];

  /** Crea y almacena una nueva sala. */
  createRoom(
    showType: "default" | "custom" | "music",
    creatorUid: string,
    presetId?: string
  ): Room {
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
    };
    this.rooms.push(room);
    return room;
  }

  /** Devuelve la sala por su ID */
  getRoom(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  /** Devuelve todas las salas (para debugging) */
  getRooms(): Room[] {
    return this.rooms;
  }

  /** Cambia el estado de la sala a 'active' cuando el anfitrión arranca el show */
  startRoom(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;
    room.status = "active";
    return true;
  }

  /** Chequea si ya está en estado 'active' */
  isRoomStarted(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;
    return room.status === "active";
  }
}
