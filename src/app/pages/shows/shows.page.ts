import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { LightService } from "../../services/light.service"
import { LightMode } from "../../models/light.model"

@Component({
  selector: "app-shows",
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: "./shows.page.html",
  styleUrls: ["./shows.page.scss"],
})
export class ShowsPage {
  shows = [
    {
      id: LightMode.DEFAULT,
      name: "Predeterminado",
      description: "Colores y efectos definidos previamente",
      icon: "color-palette",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: LightMode.CUSTOM,
      name: "Personalizado",
      description: "El usuario elige color y brillo",
      icon: "options",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: LightMode.MUSIC,
      name: "Sincronizado con música",
      description: "Los efectos se adaptan al ritmo (en versión futura)",
      icon: "musical-notes",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
  ]

  constructor(
    private router: Router,
    private lightService: LightService,
  ) {}

  connectDevices() {
    this.router.navigateByUrl("/connection")
  }

  selectShow(showId: string) {
    console.log("Seleccionado:", showId)

    // Establecer el modo seleccionado
    this.lightService.setMode(showId as LightMode)

    // Redirigir al control de luces
    if (showId === LightMode.MUSIC) {
      // Para el modo música, podríamos mostrar un mensaje o alguna indicación
      console.log("Función disponible en versión futura")
    }

    this.router.navigateByUrl("/light-control")
  }
}

export default ShowsPage