import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RoomService } from "src/app/services/room.service"
import type { Room } from "src/app/models/room.model"
import type { Subscription } from "rxjs"

/** Importa tus tres páginas Standalone para inyectarlas en el switch */
import LightControlPage from "../light-control/light-control.page"
import { MusicSyncPage } from "../music-sync/music-sync.page"
import { PresetModesPage } from "../preset-modes/preset-modes.page"

@Component({
  selector: "app-room-player",
  standalone: true,
  imports: [CommonModule, IonicModule, LightControlPage, MusicSyncPage, PresetModesPage],
  templateUrl: "./room-player.page.html",
  styleUrls: ["./room-player.page.scss"],
})
export class RoomPlayerPage implements OnInit, OnDestroy {
  room?: Room
  showType?: "default" | "custom" | "music"
  roomId = ""
  private routeSub?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en los parámetros de la ruta
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (!id) {
        console.warn("No se indicó roomId en la URL.")
        return
      }

      this.roomId = id
      this.loadRoom()
    })
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe()
    }
  }

  private loadRoom(): void {
    // Recuperar la sala
    const fetchedRoom = this.roomService.getRoom(this.roomId)
    if (!fetchedRoom) {
      console.warn("Sala no encontrada en RoomService:", this.roomId)
      // Redirigir a home si no se encuentra la sala
      this.router.navigate(["/home"])
      return
    }

    this.room = fetchedRoom
    this.showType = fetchedRoom.showType

    console.log(`Sala cargada: ${this.roomId}, tipo: ${this.showType}, estado: ${fetchedRoom.status}`)

    // Si el showType es 'default' y aún no está activo, marcamos animationActive
    if (this.room && !this.room.animationActive && this.room.status === "active") {
      this.room.animationActive = true
      console.log(`Activando animación para sala ${this.roomId}`)
    }
  }
}

export default RoomPlayerPage