import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Subscription } from "rxjs"
import { Light, Preset, TimerSettings } from "../../models/light.model"
import { LightService } from "../../services/light.service";
import { BluetoothService } from "../../services/bluetooth.service"
import { FilterByPipe } from "../../pipes/filter-by.pipe"

// Importar componentes Ionic desde standalone
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToggle,
  IonItem,
  IonRange,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonList,
  IonText,
  IonChip,
  IonFooter,
  ToastController,
} from "@ionic/angular/standalone"

// Importar addIcons para los iconos
import { addIcons } from "ionicons"
import {
  bulbOutline,
  bulb,
  bluetoothOutline,
  bluetooth,
  timerOutline,
  contrastOutline,
  flashOutline,
  chevronUpOutline,
  chevronDownOutline,
  colorWandOutline,
  addOutline,
  closeOutline,
  saveOutline,
} from "ionicons/icons"

@Component({
  selector: "app-light-control",
  templateUrl: "./light-control.page.html",
  styleUrls: ["./light-control.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterByPipe,
    // Importar componentes Ionic individualmente
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToggle,
    IonItem,
    IonRange,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonList,
    IonText,
    IonChip,
    IonFooter,
  ],
})
export class LightControlPage implements OnInit, OnDestroy {
  // Datos del componente
  lights: Light[] = []
  presets: Preset[] = []
  timerSettings: TimerSettings = { active: false, interval: 5, selectedPresetId: 1 }
  bluetoothConnected = false
  bluetoothSearching = false

  // Estados de UI
  showTimerModal = false
  showSavePresetModal = false
  newPresetName = ""
  expandedLightId: number | null = null

  // Colores predefinidos para selección rápida
  quickColors = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffffff"]

  // Suscripciones
  private subscriptions: Subscription[] = []

  constructor(
    private lightService: LightService,
    private bluetoothService: BluetoothService,
    private toastController: ToastController,
  ) {
    // Registrar los iconos
    addIcons({
      timerOutline,
      contrastOutline,
      flashOutline,
      colorWandOutline,
      addOutline,
      closeOutline,
      saveOutline,
      bulbOutline,
      bulb,
      bluetoothOutline,
      bluetooth,
      chevronUpOutline,
      chevronDownOutline
    });

  }

  ngOnInit() {
    // Suscribirse a los cambios en los servicios
    this.subscriptions.push(
      this.lightService.lights$.subscribe((lights) => {
        this.lights = lights
      }),

      this.lightService.presets$.subscribe((presets) => {
        this.presets = presets
      }),

      this.lightService.timerSettings$.subscribe((settings) => {
        this.timerSettings = settings
      }),

      this.bluetoothService.connectionStatus$.subscribe((status) => {
        this.bluetoothConnected = status
      }),

      this.bluetoothService.searchingStatus$.subscribe((status) => {
        this.bluetoothSearching = status
      }),
    )
  }

  ngOnDestroy() {
    // Cancelar todas las suscripciones para evitar memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe())

    // Asegurarse de que el temporizador se detenga
    this.lightService.clearTimer()
  }

  /**
   * Cambia el estado de encendido/apagado de una luz
   */
  toggleLight(id: number): void {
    this.lightService.toggleLight(id)
  }

  /**
   * Cambia el color de una luz por valor hexadecimal
   */
  changeColor(id: number, event: any): void {
    const color = event.target.value
    this.lightService.changeColor(id, color)
  }

  /**
   * Cambia el color de una luz por valores RGB
   */
  changeRgbColor(id: number, channel: "r" | "g" | "b", value: number): void {
    this.lightService.changeRgbColor(id, channel, value)
  }

  /**
   * Cambia el brillo de una luz
   */
  changeBrightness(id: number, event: any): void {
    const brightness = event.detail.value
    this.lightService.changeBrightness(id, brightness)
  }

  /**
   * Guarda un nuevo preset
   */
  async saveNewPreset(): Promise<void> {
    if (this.newPresetName.trim() === "") {
      await this.showToast("Por favor ingresa un nombre para el preset")
      return
    }

    const activeLights = this.lights.filter((light) => light.isOn)
    if (activeLights.length === 0) {
      await this.showToast("Debes tener al menos una luz encendida para guardar un preset")
      return
    }

    const newPresetId = this.lightService.saveNewPreset(this.newPresetName)

    if (newPresetId) {
      this.newPresetName = ""
      this.showSavePresetModal = false
      await this.showToast("Preset guardado correctamente")
    }
  }

  /**
   * Aplica un preset a las luces encendidas
   */
  async applyPreset(presetId: number): Promise<void> {
    const success = this.lightService.applyPreset(presetId)

    if (success) {
      const preset = this.presets.find((p) => p.id === presetId)
      await this.showToast(`Preset "${preset?.name}" aplicado`)
    }
  }

  /**
   * Conecta o desconecta el dispositivo Bluetooth
   */
  async toggleBluetooth(): Promise<void> {
    try {
      const connected = await this.bluetoothService.toggleConnection()
      await this.showToast(connected ? "Dispositivo Bluetooth conectado" : "Dispositivo Bluetooth desconectado")
    } catch (error) {
      await this.showToast("Error al conectar con el dispositivo Bluetooth")
    }
  }

  /**
   * Expande o colapsa los controles avanzados de una luz
   */
  toggleExpandLight(id: number): void {
    this.expandedLightId = this.expandedLightId === id ? null : id
  }

  /**
   * Enciende todas las luces
   */
  turnAllLightsOn(): void {
    this.lightService.turnAllLightsOn()
  }

  /**
   * Apaga todas las luces
   */
  turnAllLightsOff(): void {
    this.lightService.turnAllLightsOff()
  }

  /**
   * Guarda la configuración del temporizador
   */
  saveTimerSettings(): void {
    this.lightService.updateTimerSettings(this.timerSettings)
    this.showTimerModal = false

    if (this.timerSettings.active) {
      this.showToast("Temporizador activado")
    }
  }

  /**
   * Muestra un mensaje toast
   */
  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
    })
    await toast.present()
  }

  /**
   * Aplica un color predefinido a una luz
   */
  applyQuickColor(lightId: number, color: string): void {
    const light = this.lights.find((l) => l.id === lightId)
    if (light && light.isOn) {
      this.lightService.changeColor(lightId, color)
    }
  }
  getRangeValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    } else if (value && typeof value.lower === 'number') {
      return value.lower; // O usa `value.upper` si necesitas el valor superior
    }
    return 0; // Valor por defecto si hay algún error
  }
}

