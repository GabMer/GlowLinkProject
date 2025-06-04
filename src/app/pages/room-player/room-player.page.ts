import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RoomService } from "src/app/services/room.service";
import { Room } from "src/app/models/room.model";

/** Importa tus tres páginas Standalone para inyectarlas en el switch */
import { LightControlPage } from "../light-control/light-control.page";
import { MusicSyncPage } from "../music-sync/music-sync.page";
import { PresetModesPage } from "../preset-modes/preset-modes.page";

@Component({
    selector: "app-room-player",
    standalone: true,
    imports: [CommonModule, IonicModule, LightControlPage, MusicSyncPage, PresetModesPage],
    templateUrl: "./room-player.page.html",
    styleUrls: ["./room-player.page.scss"],
})
export class RoomPlayerPage implements OnInit {
    room?: Room;
    showType?: "default" | "custom" | "music";

    constructor(private route: ActivatedRoute, private roomService: RoomService) { }

    ngOnInit(): void {
        // 1) Tomar el parámetro ':id' de la URL
        const roomId = this.route.snapshot.paramMap.get("id");
        if (!roomId) {
            console.warn("No se indicó roomId en la URL.");
            return;
        }

        // 2) Recuperar la sala que creaste antes
        const fetchedRoom = this.roomService.getRoom(roomId);
        if (!fetchedRoom) {
            console.warn("Sala no encontrada en RoomService:", roomId);
            return;
        }

        this.room = fetchedRoom;
        this.showType = fetchedRoom.showType; // 'default' | 'custom' | 'music'

        // 3) Si el showType es 'default' y aún no está activo, marcamos animationActive
        if (this.room && !this.room.animationActive) {
            this.room.animationActive = true;
        }
    }
}
