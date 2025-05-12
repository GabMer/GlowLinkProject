import { Component } from "@angular/core"
import { RouterModule, Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { LightService } from "../../services/light.service"

@Component({
  selector: "app-home",
  standalone: true,
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  imports: [CommonModule, IonicModule, RouterModule],
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
      description: "Los efectos se adaptan al ritmo (en versión futura)",
      icon: "musical-notes",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
  ];

  constructor(
    private router: Router,
    private lightService: LightService,
  ) {}

  connectDevices() {
    console.log("Función de conexión de dispositivos no implementada aún");
  }

  selectShow(showId: string) {
    console.log("Seleccionado:", showId);
    this.lightService.setMode(showId);

    if (showId === "music") {
      console.log("Función disponible en versión futura");
    }

    this.router.navigateByUrl("/light-control");
  }
}
