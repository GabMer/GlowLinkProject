<<<<<<< Updated upstream
import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"
import { Light } from "../../models/light.model"
import { LightService } from "../../services/light.service"
import { BluetoothService } from "../../services/bluetooth.service"
import { SettingsService } from "../../services/settings.service"

import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBackButton,
    IonChip,
    IonFooter,
    ToastController,
    IonBadge,
    IonSpinner,
} from "@ionic/angular/standalone"

import { addIcons } from "ionicons"
import {
    colorPaletteOutline,
    playOutline,
    pauseOutline,
    eyeOutline,
    checkmarkCircleOutline,
    arrowBack,
    flashOutline,
    contrastOutline,
    bluetoothOutline,
    bluetooth,
    homeOutline,
    sparklesOutline,
    moonOutline,
    sunny,
    musicalNoteOutline,
    leafOutline,
    heartOutline,
    waterOutline,
    flameOutline,
    snowOutline,
    prismOutline,
    pulseOutline,
    sunnyOutline, personCircleOutline, settingsOutline, logOutOutline } from "ionicons/icons"

@Component({
    selector: "app-preset-modes",
    templateUrl: "./preset-modes.page.html",
    styleUrls: ["./preset-modes.page.scss"],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonLabel,
        IonBackButton,
        IonChip,
        IonFooter,
        IonBadge,
        IonSpinner,
    ],
})
export class PresetModesPage implements OnInit, OnDestroy {
    // Datos del componente
    lights: Light[] = []
    bluetoothConnected = false
    sensitivityModeEnabled = false

    // Estado de UI
    activeMode: string | null = null
    previewMode: string | null = null
    isActivating = false

    // Modos predeterminados
    presetModes = [
        {
            id: "fiesta",
            nombre: "Fiesta",
            descripcion: "Colores vibrantes que cambian rápidamente",
            icono: "sparkles-outline",
            colores: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
            velocidad: "rapido",
            intervalo: 500, // milisegundos entre cambios
        },
        {
            id: "relax",
            nombre: "Relax",
            descripcion: "Colores cálidos y transiciones suaves",
            icono: "moon-outline",
            colores: ["#4A00FF", "#00FFFF", "#FF00FF", "#9966FF"],
            velocidad: "lento",
            intervalo: 3000,
        },
        {
            id: "amanecer",
            nombre: "Amanecer",
            descripcion: "Simula una salida del sol con tonos suaves",
            icono: "sunrise-outline",
            colores: ["#8B0000", "#FF4500", "#FFA500", "#FFD700"],
            velocidad: "muy-lento",
            intervalo: 5000,
        },
        {
            id: "ritmo",
            nombre: "Ritmo Lento",
            descripcion: "Cambios sincronizados con música suave",
            icono: "musical-note-outline",
            colores: ["#800080", "#4B0082", "#0000FF", "#008080"],
            velocidad: "medio",
            intervalo: 2000,
        },
        {
            id: "meditacion",
            nombre: "Meditación",
            descripcion: "Luces tenues, muy lentas",
            icono: "leaf-outline",
            colores: ["#006400", "#008080", "#4682B4", "#483D8B"],
            velocidad: "muy-lento",
            intervalo: 8000,
        },
        {
            id: "romantico",
            nombre: "Romántico",
            descripcion: "Tonos rojos y rosados suaves",
            icono: "heart-outline",
            colores: ["#8B0000", "#CD5C5C", "#DB7093", "#FF69B4"],
            velocidad: "lento",
            intervalo: 4000,
        },
        {
            id: "oceano",
            nombre: "Océano",
            descripcion: "Tonos azules y verdes como el mar",
            icono: "water-outline",
            colores: ["#00008B", "#0000CD", "#4169E1", "#00BFFF", "#00CED1"],
            velocidad: "medio",
            intervalo: 2500,
        },
        {
            id: "fuego",
            nombre: "Fuego",
            descripcion: "Tonos cálidos como una llama",
            icono: "flame-outline",
            colores: ["#8B0000", "#B22222", "#CD5C5C", "#FF4500", "#FF8C00"],
            velocidad: "medio",
            intervalo: 1500,
        },
        {
            id: "invierno",
            nombre: "Invierno",
            descripcion: "Tonos fríos y azulados",
            icono: "snow-outline",
            colores: ["#F0F8FF", "#B0E0E6", "#ADD8E6", "#87CEEB", "#4682B4"],
            velocidad: "lento",
            intervalo: 3500,
        },
        {
            id: "arcoiris",
            nombre: "Arcoíris",
            descripcion: "Todos los colores del arcoíris",
            icono: "prism-outline",
            colores: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
            velocidad: "medio",
            intervalo: 2000,
        },
    ]

    // Intervalos para animaciones
    previewIntervals: { [key: string]: any } = {}
    activeInterval: any = null
    currentColorIndex = 0

    // Suscripciones
    private subscriptions: Subscription[] = []

    constructor(
        private lightService: LightService,
        private bluetoothService: BluetoothService,
        private settingsService: SettingsService,
        private toastController: ToastController,
        private router: Router,
    ) {
        /// Registrar los iconos
        addIcons({personCircleOutline,homeOutline,settingsOutline,logOutOutline,colorPaletteOutline,eyeOutline,playOutline,checkmarkCircleOutline,pulseOutline,pauseOutline,arrowBack,flashOutline,contrastOutline,bluetoothOutline,bluetooth,sparklesOutline,moonOutline,sunny,musicalNoteOutline,leafOutline,heartOutline,waterOutline,flameOutline,snowOutline,prismOutline});

    }

    ngOnInit() {
        // Suscribirse a los cambios en los servicios
        this.subscriptions.push(
            this.lightService.lights$.subscribe((lights) => {
                this.lights = lights
            }),

            this.bluetoothService.connectionStatus$.subscribe((status) => {
                this.bluetoothConnected = status
            }),

            // Suscribirse al modo de sensibilidad
            this.settingsService.sensitivityMode$.subscribe((enabled) => {
                this.sensitivityModeEnabled = enabled

                // Ajustar velocidades si el modo de sensibilidad está activado
                if (enabled) {
                    this.adjustIntervalForSensitivityMode()
                }
            }),
        )

        // Verificar si ya hay un modo activo
        const currentMode = this.lightService.getCurrentMode()
        if (currentMode && currentMode.startsWith("preset:")) {
            this.activeMode = currentMode.replace("preset:", "")

            // Iniciar la animación del modo activo
            this.startModeAnimation(this.activeMode)
        }
    }

    ngOnDestroy() {
        // Cancelar todas las suscripciones para evitar memory leaks
        this.subscriptions.forEach((sub) => sub.unsubscribe())

        // Limpiar todos los intervalos
        this.clearAllIntervals()
    }

    /**
     * Ajusta los intervalos para el modo de sensibilidad
     */
    adjustIntervalForSensitivityMode() {
        if (this.sensitivityModeEnabled) {
            // Hacer las transiciones más lentas para el modo de sensibilidad
            this.presetModes.forEach((mode) => {
                mode.intervalo = mode.intervalo * 1.5
            })
        } else {
            // Restaurar los intervalos originales
            this.presetModes = [
                { ...this.presetModes[0], intervalo: 500 },
                { ...this.presetModes[1], intervalo: 3000 },
                { ...this.presetModes[2], intervalo: 5000 },
                { ...this.presetModes[3], intervalo: 2000 },
                { ...this.presetModes[4], intervalo: 8000 },
                { ...this.presetModes[5], intervalo: 4000 },
                { ...this.presetModes[6], intervalo: 2500 },
                { ...this.presetModes[7], intervalo: 1500 },
                { ...this.presetModes[8], intervalo: 3500 },
                { ...this.presetModes[9], intervalo: 2000 },
            ]
        }
    }

    /**
     * Inicia la vista previa de un modo
     */
    startPreview(modeId: string) {
        // Detener cualquier vista previa anterior
        this.stopPreview()

        // Establecer el modo de vista previa actual
        this.previewMode = modeId

        // Obtener el modo
        const mode = this.presetModes.find((m) => m.id === modeId)
        if (!mode) return

        // Iniciar la animación de vista previa
        let colorIndex = 0
        this.previewIntervals[modeId] = setInterval(() => {
            const previewElement = document.getElementById(`preview-${modeId}`)
            if (previewElement) {
                previewElement.style.backgroundColor = mode.colores[colorIndex]
                colorIndex = (colorIndex + 1) % mode.colores.length
            }
        }, mode.intervalo / 2) // Vista previa más rápida que la animación real
    }

    /**
     * Detiene la vista previa
     */
    stopPreview() {
        // Limpiar todos los intervalos de vista previa
        Object.keys(this.previewIntervals).forEach((key) => {
            clearInterval(this.previewIntervals[key])
            delete this.previewIntervals[key]
        })

        // Resetear el modo de vista previa
        this.previewMode = null
    }

    /**
     * Activa un modo predeterminado
     */
    async activateMode(modeId: string) {
        // Detener cualquier vista previa
        this.stopPreview()

        // Detener el modo activo actual si existe
        if (this.activeInterval) {
            clearInterval(this.activeInterval)
            this.activeInterval = null
        }

        // Establecer el nuevo modo activo
        this.activeMode = modeId
        this.isActivating = true

        // Obtener el modo
        const mode = this.presetModes.find((m) => m.id === modeId)
        if (!mode) return

        // Asegurarse de que todas las luces estén encendidas
        this.lightService.turnAllLightsOn()

        // Establecer el modo en el servicio
        this.lightService.setMode(`preset:${modeId}`)

        // Iniciar la animación del modo
        this.startModeAnimation(modeId)

        // Mostrar mensaje de confirmación
        await this.showToast(`Modo ${mode.nombre} activado`)

        this.isActivating = false
    }

    /**
     * Inicia la animación de un modo
     */
    startModeAnimation(modeId: string) {
        // Obtener el modo
        const mode = this.presetModes.find((m) => m.id === modeId)
        if (!mode) return

        // Iniciar la animación
        this.currentColorIndex = 0

        // Aplicar el primer color inmediatamente
        this.applyColorToLights(mode.colores[this.currentColorIndex])

        // Configurar el intervalo para cambiar colores
        this.activeInterval = setInterval(() => {
            this.currentColorIndex = (this.currentColorIndex + 1) % mode.colores.length
            this.applyColorToLights(mode.colores[this.currentColorIndex])
        }, mode.intervalo)
    }

    /**
     * Aplica un color a todas las luces encendidas
     */
    applyColorToLights(color: string) {
        const lights = this.lightService.getLights()
        const updatedLights = lights.map((light) => {
            if (light.isOn) {
                const rgb = this.hexToRgb(color)
                return { ...light, color, rgb }
            }
            return light
        })

        this.lightService.lightsSubject.next(updatedLights)

        // Enviar datos al dispositivo Bluetooth si está conectado
        if (this.bluetoothConnected) {
            this.bluetoothService.sendData({
                type: "colorChange",
                color: color,
            })
=======
import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import type { Subscription } from "rxjs"

import type { Light } from "../../models/light.model"
import { LightService } from "../../services/light.service"
import { BluetoothService } from "../../services/bluetooth.service"
import { SettingsService } from "../../services/settings.service"
import { Share } from "@capacitor/share"
import { IonicModule, ToastController } from "@ionic/angular"
import { addIcons } from "ionicons"
import { RoomService } from "../../services/room.service"
import type { Room } from "../../models/room.model"

import {
  colorPaletteOutline,
  playOutline,
  eyeOutline,
  checkmarkCircleOutline,
  flashOutline,
  contrastOutline,
  bluetoothOutline,
  bluetooth,
  homeOutline,
  sparklesOutline,
  moonOutline,
  sunny,
  musicalNoteOutline,
  leafOutline,
  heartOutline,
  waterOutline,
  flameOutline,
  snowOutline,
  prismOutline,
  pulseOutline,
  sunnyOutline,
  personCircleOutline,
  settingsOutline,
  logOutOutline,
} from "ionicons/icons"

@Component({
  selector: "app-preset-modes",
  standalone: true,
  templateUrl: "./preset-modes.page.html",
  styleUrls: ["./preset-modes.page.scss"],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PresetModesPage implements OnInit, OnDestroy {
  // --- Datos internos ---
  lights: Light[] = []
  bluetoothConnected = false
  sensitivityModeEnabled = false

  // --- Estado de UI ---
  activeMode: string | null = null // Si es 'fiesta', 'relax', etc.
  previewMode: string | null = null // Para vista previa momentánea
  isActivating = false // Mientas arranca el preset
  previewBackgroundColor = "#000" // color de fondo en preview
  roomId: string | null = null // ID real de la sala (UUID)

  // --- Definición de modos predeterminados ---
  presetModes = [
    {
      id: "fiesta",
      nombre: "Fiesta",
      descripcion: "Colores vibrantes que cambian rápidamente",
      icono: "sparkles-outline",
      colores: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
      velocidad: "rapido",
      intervalo: 500,
    },
    {
      id: "relax",
      nombre: "Relax",
      descripcion: "Colores cálidos y transiciones suaves",
      icono: "moon-outline",
      colores: ["#4A00FF", "#00FFFF", "#FF00FF", "#9966FF"],
      velocidad: "lento",
      intervalo: 3000,
    },
    {
      id: "amanecer",
      nombre: "Amanecer",
      descripcion: "Simula una salida del sol con tonos suaves",
      icono: "sunny-outline",
      colores: ["#8B0000", "#FF4500", "#FFA500", "#FFD700"],
      velocidad: "muy-lento",
      intervalo: 5000,
    },
    {
      id: "ritmo",
      nombre: "Ritmo Lento",
      descripcion: "Cambios sincronizados con música suave",
      icono: "musical-note-outline",
      colores: ["#800080", "#4B0082", "#0000FF", "#008080"],
      velocidad: "medio",
      intervalo: 2000,
    },
    {
      id: "meditacion",
      nombre: "Meditación",
      descripcion: "Luces tenues, muy lentas",
      icono: "leaf-outline",
      colores: ["#006400", "#008080", "#4682B4", "#483D8B"],
      velocidad: "muy-lento",
      intervalo: 8000,
    },
    {
      id: "romantico",
      nombre: "Romántico",
      descripcion: "Tonos rojos y rosados suaves",
      icono: "heart-outline",
      colores: ["#8B0000", "#CD5C5C", "#DB7093", "#FF69B4"],
      velocidad: "lento",
      intervalo: 4000,
    },
    {
      id: "oceano",
      nombre: "Océano",
      descripcion: "Tonos azules y verdes como el mar",
      icono: "water-outline",
      colores: ["#00008B", "#0000CD", "#4169E1", "#00BFFF", "#00CED1"],
      velocidad: "medio",
      intervalo: 2500,
    },
    {
      id: "fuego",
      nombre: "Fuego",
      descripcion: "Tonos cálidos como una llama",
      icono: "flame-outline",
      colores: ["#8B0000", "#B22222", "#CD5C5C", "#FF4500", "#FF8C00"],
      velocidad: "medio",
      intervalo: 1500,
    },
    {
      id: "invierno",
      nombre: "Invierno",
      descripcion: "Tonos fríos y azulados",
      icono: "snow-outline",
      colores: ["#F0F8FF", "#B0E0E6", "#ADD8E6", "#87CEEB", "#4682B4"],
      velocidad: "lento",
      intervalo: 3500,
    },
    {
      id: "arcoiris",
      nombre: "Arcoíris",
      descripcion: "Todos los colores del arcoíris",
      icono: "prism-outline",
      colores: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
      velocidad: "medio",
      intervalo: 2000,
    },
  ]

  // Para controlar los intervalos de preview y animación real:
  previewIntervals: { [key: string]: any } = {}
  activeInterval: any = null
  currentColorIndex = 0

  private subscriptions: Subscription[] = []

  constructor(
    private lightService: LightService,
    private bluetoothService: BluetoothService,
    private settingsService: SettingsService,
    private toastController: ToastController,
    private router: Router,
    private roomService: RoomService,
  ) {
    // Registramos Ionicons que vayamos a usar
    addIcons({
      "color-palette-outline": colorPaletteOutline,
      "play-outline": playOutline,
      "eye-outline": eyeOutline,
      "checkmark-circle-outline": checkmarkCircleOutline,
      "flash-outline": flashOutline,
      "contrast-outline": contrastOutline,
      "bluetooth-outline": bluetoothOutline,
      bluetooth: bluetooth,
      "home-outline": homeOutline,
      "sparkles-outline": sparklesOutline,
      "moon-outline": moonOutline,
      sunny: sunny,
      "musical-note-outline": musicalNoteOutline,
      "leaf-outline": leafOutline,
      "heart-outline": heartOutline,
      "water-outline": waterOutline,
      "flame-outline": flameOutline,
      "snow-outline": snowOutline,
      "prism-outline": prismOutline,
      "pulse-outline": pulseOutline,
      "sunny-outline": sunnyOutline,
      "person-circle-outline": personCircleOutline,
      "settings-outline": settingsOutline,
      "log-out-outline": logOutOutline,
    })
  }

  ngOnInit() {
    // 1) Nos suscribimos a los servicios para luz y Bluetooth
    this.subscriptions.push(
      this.lightService.lights$.subscribe((lights) => {
        this.lights = lights
      }),
      this.bluetoothService.connectionStatus$.subscribe((status) => {
        this.bluetoothConnected = status
      }),
      this.settingsService.sensitivityMode$.subscribe((enabled) => {
        this.sensitivityModeEnabled = enabled
        if (enabled) {
          this.adjustIntervalForSensitivityMode()
        } else {
          this.restoreOriginalIntervals()
        }
      }),
    )

    // 2) Verificamos si vinimos desde RoomPlayerPage (/room-player/:id),
    //    para "preseleccionar" el presetId que guardamos en la sala.
    const urlParts = this.router.url.split("/")
    // urlParts[0] == "" (slash inicial), urlParts[1] == "room-player", urlParts[2] == "<UUID>"
    if (urlParts.length >= 3 && urlParts[1] === "room-player") {
      const roomId = urlParts[2]
      const room = this.roomService.getRoom(roomId)
      if (room && room.showType === "default" && room.presetId) {
        // Marcamos ese preset como activo
        this.activeMode = room.presetId
        // Iniciamos inmediatamente su animación
        this.startModeAnimation(room.presetId)
        // También guardamos localmente el roomId
        this.roomId = roomId
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.clearAllIntervals()
  }

  /** Si cambió el modo de "sensibilidad", hacemos que las transiciones sean más lentas */
  adjustIntervalForSensitivityMode() {
    this.presetModes.forEach((mode) => {
      mode.intervalo = mode.intervalo * 1.5
    })
  }
  restoreOriginalIntervals() {
    this.presetModes = [
      { ...this.presetModes[0], intervalo: 500 },
      { ...this.presetModes[1], intervalo: 3000 },
      { ...this.presetModes[2], intervalo: 5000 },
      { ...this.presetModes[3], intervalo: 2000 },
      { ...this.presetModes[4], intervalo: 8000 },
      { ...this.presetModes[5], intervalo: 4000 },
      { ...this.presetModes[6], intervalo: 2500 },
      { ...this.presetModes[7], intervalo: 1500 },
      { ...this.presetModes[8], intervalo: 3500 },
      { ...this.presetModes[9], intervalo: 2000 },
    ]
  }

  /** Inicia la animación de "preview" (pantalla completa, tocable para salir). */
  startPreview(modeId: string) {
    this.stopPreview()
    const mode = this.presetModes.find((m) => m.id === modeId)
    if (!mode) return

    let colorIndex = 0
    this.previewMode = modeId
    this.previewBackgroundColor = mode.colores[0] || "#000"

    this.previewIntervals[modeId] = setInterval(() => {
      this.previewBackgroundColor = mode.colores[colorIndex]
      colorIndex = (colorIndex + 1) % mode.colores.length
    }, mode.intervalo / 2)
  }

  stopPreview() {
    Object.values(this.previewIntervals).forEach((i) => clearInterval(i))
    this.previewMode = null
  }

  /** Este método abre el preset real (no preview), crea la sala en RoomService y navega. */
  async activateMode(modeId: string) {
    try {
      // 1) Detenemos cualquier preview o animación anterior
      this.stopPreview()
      if (this.activeInterval) {
        clearInterval(this.activeInterval)
        this.activeInterval = null
      }

      // 2) Marcamos activeMode = presetId
      this.activeMode = modeId
      this.isActivating = true

      // 3) Prendemos todas las luces y arrancamos animación local
      const mode = this.presetModes.find((m) => m.id === modeId)
      if (!mode) return

      this.lightService.turnAllLightsOn()
      this.lightService.setMode(`preset:${modeId}`)
      this.startModeAnimation(modeId)

      // 4) Mostramos toast "Modo X activado"
      await this.showToast(`Modo ${mode.nombre} activado`)

      // 5) Creamos la sala en RoomService con showType='default', presetId=modeId
      const newRoom: Room = this.roomService.createRoom("default", "user123", modeId)
      this.roomId = newRoom.id

      // 6) Iniciamos la sala para que esté activa
      this.roomService.startRoom(newRoom.id)

      // 7) Navegamos a room-player/<NUEVO_ID>
      console.log(`Navegando a /room-player/${this.roomId}`)
      this.isActivating = false

      // Usar setTimeout para asegurar que la navegación ocurra después de que todo esté listo
      setTimeout(() => {
        this.router.navigate(["/room-player", this.roomId])
      }, 100)
    } catch (error) {
      console.error("Error al activar modo:", error)
      this.isActivating = false
      this.showToast("Error al activar el modo")
    }
  }

  /** La animación "real" que va rotando colores en la app */
  startModeAnimation(modeId: string) {
    const mode = this.presetModes.find((m) => m.id === modeId)
    if (!mode) return

    this.currentColorIndex = 0
    // Aplico el primer color de inmediato
    this.applyColorToLights(mode.colores[this.currentColorIndex])

    // Luego seteo el interval
    this.activeInterval = setInterval(() => {
      this.currentColorIndex = (this.currentColorIndex + 1) % mode.colores.length
      this.applyColorToLights(mode.colores[this.currentColorIndex])
    }, mode.intervalo)
  }

  /** Cambia el color de todos los "lights" encendidos */
  applyColorToLights(color: string) {
    const lights = this.lightService.getLights()
    const updatedLights = lights.map((light) => {
      if (light.isOn) {
        const rgb = this.hexToRgb(color)
        return { ...light, color, rgb }
      }
      return light
    })
    this.lightService.lightsSubject.next(updatedLights)

    // (Sólo para compatibilidad si en algún momento realmente usaras Bluetooth, aunque ahora no es el caso)
    if (this.bluetoothConnected) {
      this.bluetoothService.sendData({ type: "colorChange", color })
    }
  }

  /**
   *  Al presionar el ícono de "Bluetooth", si todavía NO existía roomId,
   *  creamos una nueva sala con el preset actualmente activo (o 'fiesta' por defecto).
   *  Luego siempre abrimos el diálogo de "compartir" (capacitor/share).
   */
  onBluetoothButtonClick() {
    if (!this.roomId) {
      const selected = this.activeMode || "fiesta"
      const newRoom: Room = this.roomService.createRoom("default", "user123", selected)
      this.roomId = newRoom.id
      console.log(`Sala creada con código: ${this.roomId}`)
    } else {
      console.log(`Sala ya existente: ${this.roomId}`)
    }
    this.shareRoomCode()
  }

  async shareRoomCode() {
    if (!this.roomId) return
    const shareText = `Únete a mi sala con el código: ${this.roomId}`
    const shareUrl = `https://glowlink.com/room-player/${this.roomId}`
    try {
      await Share.share({
        title: "Invitación a la sala",
        text: shareText,
        url: shareUrl,
        dialogTitle: "Compartir sala",
      })
      console.log("Compartido correctamente")
    } catch (error) {
      console.error("Error al compartir:", error)
    }
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
>>>>>>> Stashed changes
        }
      : { r: 0, g: 0, b: 0 }
  }

<<<<<<< Updated upstream
    /**
     * Convierte un color hexadecimal a RGB
     */
    hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                r: Number.parseInt(result[1], 16),
                g: Number.parseInt(result[2], 16),
                b: Number.parseInt(result[3], 16),
            }
            : { r: 0, g: 0, b: 0 }
    }

    /**
     * Limpia todos los intervalos
     */
    clearAllIntervals() {
        // Limpiar intervalos de vista previa
        Object.keys(this.previewIntervals).forEach((key) => {
            clearInterval(this.previewIntervals[key])
        })

        // Limpiar intervalo activo
        if (this.activeInterval) {
            clearInterval(this.activeInterval)
            this.activeInterval = null
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
     * Navega a la página de inicio
     */
    goToHome() {
        this.router.navigate(["/home"])
    }

    get activeModeName(): string | undefined {
        return this.presetModes.find(m => m.id === this.activeMode)?.nombre;
    }

=======
  clearAllIntervals() {
    Object.values(this.previewIntervals).forEach((i) => clearInterval(i))
    if (this.activeInterval) clearInterval(this.activeInterval)
    this.activeInterval = null
  }

  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
    })
    await toast.present()
  }

  goToHome() {
    this.router.navigate(["/home"])
  }

  get activeModeName(): string | undefined {
    return this.presetModes.find((m) => m.id === this.activeMode)?.nombre
  }
>>>>>>> Stashed changes
}

export default PresetModesPage