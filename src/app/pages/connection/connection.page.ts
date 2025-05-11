import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { LightService } from "../../services/light.service"
import { type Light } from "../../models/light.model"

@Component({
  selector: "app-connection",
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: "./connection.page.html",
  styleUrls: ["./connection.page.scss"],
})
export class ConnectionPage implements OnInit {
  isScanning = false
  availableLights: Light[] = []

  constructor(
    private lightService: LightService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Iniciar escaneo automáticamente
    this.scanForDevices()
  }

  scanForDevices() {
    this.isScanning = true

    this.lightService
      .scanForDevices()
      .then((lights) => {
        this.availableLights = lights
        this.isScanning = false
      })
      .catch((error) => {
        console.error("Error al escanear dispositivos:", error)
        this.isScanning = false
      })
  }

  toggleConnection(light: Light) {
    if (light.connected) {
      this.lightService.disconnectLight(light.id)
    } else {
      this.lightService.connectLight(light.id)
    }
  }

  goToLightControl() {
    this.router.navigateByUrl("/light-control")
  }

  goBack() {
    this.router.navigateByUrl("/shows")
  }
}

export default ConnectionPage