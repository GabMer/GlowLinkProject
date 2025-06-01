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
    sunnyOutline, personCircleOutline, settingsOutline, logOutOutline
} from "ionicons/icons"

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


    previewBackgroundColor: string = '#000'; // inicial


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
        addIcons({ personCircleOutline, homeOutline, settingsOutline, logOutOutline, colorPaletteOutline, eyeOutline, playOutline, checkmarkCircleOutline, pulseOutline, pauseOutline, arrowBack, flashOutline, contrastOutline, bluetoothOutline, bluetooth, sparklesOutline, moonOutline, sunny, musicalNoteOutline, leafOutline, heartOutline, waterOutline, flameOutline, snowOutline, prismOutline });

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

        // Obtener el modo
        const mode = this.presetModes.find((m) => m.id === modeId)
        if (!mode) return

        // Iniciar la animación de vista previa
        let colorIndex = 0


        setTimeout(() => {
            this.previewMode = modeId;
            this.previewBackgroundColor = mode.colores[0];

            this.previewIntervals[modeId] = setInterval(() => {
                this.previewBackgroundColor = mode.colores[colorIndex];
                colorIndex = (colorIndex + 1) % mode.colores.length;
            }, mode.intervalo / 2) // Vista previa más rápida que la animación real
        }) 
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
        }
    }

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

}
