import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { LightService } from "../../services/light.service"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage {
  shows = [
    {
      id: "default",
      name: "Predeterminado",
      description: "Colores y efectos definidos previamente",
      icon: "color-palette",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: "custom",
      name: "Personalizado",
      description: "El usuario elige color y brillo",
      icon: "options",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: "music",
      name: "Sincronizado con música",
      description: "Los efectos se adaptan al ritmo",
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
    console.log("Función de conexión de dispositivos no implementada aún")
  }

  // Asegurar que la navegación al modo música funcione correctamente
  selectShow(showId: string) {
    console.log("Seleccionado:", showId)

    // Establecer el modo seleccionado
    this.lightService.setMode(showId)

    // Redirigir según el modo seleccionado
    if (showId === "music") {
      // Para el modo música, redirigir a la página de sincronización con música
      this.router.navigate(["/music-sync"])
    } else if (showId === "default") {
      // Para el modo predeterminado, redirigir a la página de modos predeterminados
      this.router.navigate(["/preset-modes"])
    } else {
      // Para otros modos, redirigir al control de luces normal
      this.router.navigate(["/light-control"])
    }
  }
}
