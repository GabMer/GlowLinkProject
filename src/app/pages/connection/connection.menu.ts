import { Component, type OnInit } from "@angular/core"
import type { ToastController, AlertController } from "@ionic/angular"
import type { ConnectionService } from "../services/connection.service"
import type { Router } from "@angular/router"

interface Device {
  id: string
  name: string
  type: string
}

@Component({
  selector: "app-connection",
  templateUrl: "./connection.page.html",
  styleUrls: ["./connection.page.scss"],
})
export class ConnectionPage implements OnInit {
  connectionType: "bluetooth" | "wifi" = "bluetooth"
  devices: Device[] = []
  connectionStatus = ""
  isConnected = false
  showNoDevicesMessage = false
  selectedMode = ""

  constructor(
    private connectionService: ConnectionService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
  ) {}

  ngOnInit() {
    // Check if we have any previously connected devices
    this.checkConnectionStatus()
  }

  connectionTypeChanged() {
    // Reset devices list when connection type changes
    this.devices = []
    this.showNoDevicesMessage = false
    this.connectionStatus = ""
  }

  selectMode(mode: string) {
    this.selectedMode = mode

    // Show toast to confirm selection
    this.presentToast(`Modo ${mode} seleccionado. Conecta un dispositivo para continuar.`)

    // If already connected, navigate to the appropriate screen
    if (this.isConnected) {
      this.navigateToModeScreen(mode)
    }
  }

  async scanDevices() {
    this.connectionStatus = "Buscando dispositivos..."
    this.showNoDevicesMessage = false

    try {
      // Simulate device scanning
      this.devices = await this.connectionService.scanDevices(this.connectionType)

      if (this.devices.length === 0) {
        this.showNoDevicesMessage = true
        this.connectionStatus = "No se encontraron dispositivos"
      } else {
        this.connectionStatus = `Se encontraron ${this.devices.length} dispositivos`
      }
    } catch (error) {
      this.connectionStatus = "Error al buscar dispositivos"
      this.presentToast("Error al buscar dispositivos. Intenta de nuevo.")
    }
  }

  async connectToDevice(device: Device) {
    this.connectionStatus = `Conectando a ${device.name}...`

    try {
      // Simulate connection
      const connected = await this.connectionService.connectToDevice(device, this.connectionType)

      if (connected) {
        this.isConnected = true
        this.connectionStatus = `Conectado a ${device.name}`
        this.presentToast(`Conectado exitosamente a ${device.name}`)

        // If a mode was already selected, navigate to that screen
        if (this.selectedMode) {
          this.navigateToModeScreen(this.selectedMode)
        }
      } else {
        this.connectionStatus = "Error de conexión"
        this.presentToast("No se pudo conectar al dispositivo. Intenta de nuevo.")
      }
    } catch (error) {
      this.connectionStatus = "Error de conexión"
      this.presentToast("Error al conectar. Intenta de nuevo.")
    }
  }

  private checkConnectionStatus() {
    const connectedDevice = this.connectionService.getConnectedDevice()

    if (connectedDevice) {
      this.isConnected = true
      this.connectionStatus = `Conectado a ${connectedDevice.name}`
    }
  }

  private navigateToModeScreen(mode: string) {
    // Navigate to the appropriate screen based on the selected mode
    switch (mode) {
      case "predeterminado":
        this.router.navigate(["/default-mode"])
        break
      case "personalizado":
        this.router.navigate(["/custom-mode"])
        break
      case "musica":
        this.router.navigate(["/music-sync"])
        break
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "bottom",
      color: "dark",
    })
    toast.present()
  }
}

