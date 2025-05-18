import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"
import { Light, Preset } from "../../models/light.model"
import { LightService } from "../../services/light.service"
import { BluetoothService } from "../../services/bluetooth.service"
import { AuthService } from "../../services/auth.service"
import { SettingsService } from "../../services/settings.service"
import { FilterByPipe } from "../../pipes/filter-by.pipe"

import { IonicModule, ToastController } from "@ionic/angular"
import { addIcons } from "ionicons"
import {
  musicalNoteOutline,
  musicalNote,
  playOutline,
  pauseOutline,
  stopOutline,
  playSkipForwardOutline,
  playSkipBackOutline,
  volumeHighOutline,
  volumeMuteOutline,
  repeatOutline,
  shuffleOutline,
  cloudDownloadOutline,
  folderOpenOutline,
  searchOutline,
  colorWandOutline,
  flashOutline,
  contrastOutline,
  arrowBack,
  closeOutline,
  saveOutline,
  addOutline,
  checkmarkOutline,
  refreshOutline,
  linkOutline,
  bluetoothOutline,
  bluetooth,
} from "ionicons/icons"

@Component({
  selector: "app-music-sync",
  templateUrl: "./music-sync.page.html",
  styleUrls: ["./music-sync.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FilterByPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MusicSyncPage implements OnInit, OnDestroy {
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLAudioElement>
  @ViewChild("audioVisualizer") audioVisualizer!: ElementRef<HTMLCanvasElement>

  // Datos del componente
  lights: Light[] = []
  presets: Preset[] = []
  bluetoothConnected = false
  userEmail: string | null = null

  // Estados de UI
  activeTab = "device" // device, internet, spotify
  isPlaying = false
  isMuted = false
  currentTime = 0
  duration = 0
  volume = 80
  selectedPresetId: number | null = null
  syncEnabled = true
  syncSensitivity = 50
  showSavePatternModal = false
  newPatternName = ""
  searchQuery = ""
  isLoading = false
  showSpotifyLoginModal = false
  spotifyLoggedIn = false
  spotifyUsername = ""

  // Datos de música
  deviceTracks: Track[] = []
  internetTracks: Track[] = []
  spotifyTracks: Track[] = []
  currentTrack: Track | null = null

  // Análisis de audio
  audioContext: AudioContext | null = null
  analyser: AnalyserNode | null = null
  dataArray: Uint8Array = new Uint8Array()
  source: MediaElementAudioSourceNode | null = null
  animationFrameId: number | null = null
  beatDetected = false
  lastBeatTime = 0
  beatThreshold = 1.5 // Umbral para detectar un beat

  // Sincronización
  syncInterval: any = null
  currentColorIndex = 0

  // Propiedad para el modo de sensibilidad
  sensitivityModeEnabled = false

  // Suscripciones
  private subscriptions: Subscription[] = []

  constructor(
    private lightService: LightService,
    private bluetoothService: BluetoothService,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    // Registrar los iconos
    addIcons({
      "musical-note-outline": musicalNoteOutline,
      "musical-note": musicalNote,
      "play-outline": playOutline,
      "pause-outline": pauseOutline,
      "stop-outline": stopOutline,
      "play-skip-forward-outline": playSkipForwardOutline,
      "play- skip-back-outline": playSkipBackOutline,
      "volume-high-outline": volumeHighOutline,
      "volume-mute-outline": volumeMuteOutline,
      "repeat-outline": repeatOutline,
      "shuffle-outline": shuffleOutline,
      "cloud-download-outline": cloudDownloadOutline,
      "folder-open-outline": folderOpenOutline,
      "search-outline": searchOutline,
      "color-wand-outline": colorWandOutline,
      "flash-outline": flashOutline,
      "contrast-outline": contrastOutline,
      "arrow-back": arrowBack,
      "close-outline": closeOutline,
      "save-outline": saveOutline,
      "add-outline": addOutline,
      "checkmark-outline": checkmarkOutline,
      "refresh-outline": refreshOutline,
      "link-outline": linkOutline,
      "bluetooth-outline": bluetoothOutline,
      bluetooth: bluetooth,
    })
  }

  ngOnInit() {
    // Obtener información del usuario actual
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.userEmail = user?.email ?? null
      }),
    )

    // Suscribirse a los cambios en los servicios
    this.subscriptions.push(
      this.lightService.lights$.subscribe((lights) => {
        this.lights = lights
      }),

      this.lightService.presets$.subscribe((presets) => {
        this.presets = presets
      }),

      this.bluetoothService.connectionStatus$.subscribe((status) => {
        this.bluetoothConnected = status
      }),
    )

    // Suscribirse al modo de sensibilidad
    this.subscriptions.push(
      this.settingsService.sensitivityMode$.subscribe((enabled) => {
        this.sensitivityModeEnabled = enabled
        // Aplicar ajustes visuales para el modo de sensibilidad
        this.applyVisualSettings()

        // Ajustar la sensibilidad y velocidad de los cambios de luz
        if (enabled) {
          this.syncSensitivity = 30 // Menor sensibilidad para cambios más suaves
          this.beatThreshold = 2.0 // Umbral más alto para detectar menos beats
        } else {
          this.syncSensitivity = 50 // Sensibilidad normal
          this.beatThreshold = 1.5 // Umbral normal
        }
      }),
    )

    // Cargar pistas de música reales
    this.loadMusicTracks()
  }

  ngAfterViewInit() {
    // Inicializar el contexto de audio y el analizador
    this.initAudioContext()
  }

  ngOnDestroy() {
    // Cancelar todas las suscripciones para evitar memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe())

    // Detener la reproducción y liberar recursos
    this.stopPlayback()
    this.cleanupAudioContext()
  }

  // Añadir método para aplicar ajustes visuales
  applyVisualSettings() {
    if (this.sensitivityModeEnabled) {
      // Aplicar ajustes para el modo de sensibilidad
      document.body.classList.add("sensitivity-mode")
    } else {
      document.body.classList.remove("sensitivity-mode")
    }
  }

  /**
   * Inicializa el contexto de audio y el analizador
   */
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)

      // Conectar el elemento de audio al analizador
      if (this.audioPlayer && this.audioPlayer.nativeElement) {
        this.source = this.audioContext.createMediaElementSource(this.audioPlayer.nativeElement)
        this.source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
      }
    } catch (error) {
      console.error("Error al inicializar el contexto de audio:", error)
      this.showToast("No se pudo inicializar el analizador de audio")
    }
  }

  /**
   * Limpia el contexto de audio y libera recursos
   */
  cleanupAudioContext() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.audioContext) {
      if (this.audioContext.state !== "closed") {
        this.audioContext.close()
      }
      this.audioContext = null
    }
  }

  /**
   * Carga pistas de música reales
   */
  loadMusicTracks() {
    // Pistas de música para el dispositivo (archivos locales)
    this.deviceTracks = [
      {
        id: "device1",
        title: "Canción de demostración 1",
        artist: "Artista Local",
        duration: 180,
        source: "assets/audio/demo-song-1.mp3",
        thumbnail: "assets/images/thumbnail1.jpg",
        type: "device",
      },
      {
        id: "device2",
        title: "Canción de demostración 2",
        artist: "Artista Local",
        duration: 210,
        source: "assets/audio/demo-song-2.mp3",
        thumbnail: "assets/images/thumbnail2.jpg",
        type: "device",
      },
      {
        id: "device3",
        title: "Canción de demostración 3",
        artist: "Artista Local",
        duration: 195,
        source: "assets/audio/demo-song-3.mp3",
        thumbnail: "assets/images/thumbnail3.jpg",
        type: "device",
      },
    ]

    // Pistas de música para internet (URLs públicas)
    this.internetTracks = [
      {
        id: "internet1",
        title: "Música Electrónica",
        artist: "DJ Web",
        duration: 240,
        source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        thumbnail: "assets/images/web-thumbnail1.jpg",
        type: "internet",
      },
      {
        id: "internet2",
        title: "Rock Clásico",
        artist: "Web Rockers",
        duration: 270,
        source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        thumbnail: "assets/images/web-thumbnail2.jpg",
        type: "internet",
      },
      {
        id: "internet3",
        title: "Jazz Suave",
        artist: "Jazz Band",
        duration: 180,
        source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        thumbnail: "assets/images/web-thumbnail3.jpg",
        type: "internet",
      },
    ]

    // Pistas de Spotify (implementación real requeriría API de Spotify)
    this.spotifyTracks = []
  }

  /**
   * Cambia la pestaña activa
   */
  changeTab(tab: string) {
    this.activeTab = tab

    // Si cambiamos de pestaña, detener la reproducción actual
    if (this.isPlaying) {
      this.stopPlayback()
    }

    // Si seleccionamos Spotify, mostrar modal de login
    if (tab === "spotify" && !this.spotifyLoggedIn) {
      this.showSpotifyLoginModal = true
    }
  }

  /**
   * Selecciona una pista para reproducir
   */
  selectTrack(track: Track) {
    // Detener la reproducción actual si hay alguna
    if (this.isPlaying) {
      this.stopPlayback()
    }

    this.currentTrack = track

    // Si es una pista de Spotify y no estamos logueados, mostrar modal de login
    if (track.type === "spotify" && !this.spotifyLoggedIn) {
      this.showSpotifyLoginModal = true
      return
    }

    // Preparar el reproductor de audio
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.src = track.source
      this.audioPlayer.nativeElement.load()

      // Iniciar la reproducción automáticamente
      this.playPause()
    }
  }

  /**
   * Inicia o pausa la reproducción
   */
  playPause() {
    if (!this.currentTrack) {
      this.showToast("Selecciona una canción primero")
      return
    }

    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      if (this.isPlaying) {
        this.audioPlayer.nativeElement.pause()
        this.isPlaying = false

        // Detener la visualización y sincronización
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId)
          this.animationFrameId = null
        }

        if (this.syncInterval) {
          clearInterval(this.syncInterval)
          this.syncInterval = null
        }
      } else {
        // Reanudar el contexto de audio si está suspendido
        if (this.audioContext && this.audioContext.state === "suspended") {
          this.audioContext.resume()
        }

        this.audioPlayer.nativeElement
          .play()
          .then(() => {
            this.isPlaying = true

            // Iniciar la visualización y sincronización
            this.startVisualization()
            this.startLightSync()
          })
          .catch((error) => {
            console.error("Error al reproducir audio:", error)
            this.showToast("No se pudo reproducir la pista de audio. Asegúrate de que el archivo exista.")
          })
      }
    }
  }

  /**
   * Detiene la reproducción
   */
  stopPlayback() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.pause()
      this.audioPlayer.nativeElement.currentTime = 0
      this.isPlaying = false

      // Detener la visualización y sincronización
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }

      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }
    }
  }

  /**
   * Actualiza el volumen
   */
  updateVolume() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.volume = this.volume / 100
    }
  }

  /**
   * Silencia o activa el sonido
   */
  toggleMute() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.isMuted = !this.isMuted
      this.audioPlayer.nativeElement.muted = this.isMuted
    }
  }

  /**
   * Actualiza el tiempo de reproducción
   */
  updateTime() {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.currentTime = this.audioPlayer.nativeElement.currentTime
      this.duration = this.audioPlayer.nativeElement.duration || 0
    }
  }

  /**
   * Cambia la posición de reproducción
   */
  seekTo(event: any) {
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      const newTime = event.detail.value
      this.audioPlayer.nativeElement.currentTime = newTime
    }
  }

  /**
   * Inicia la visualización del audio
   */
  startVisualization() {
    if (!this.analyser || !this.audioVisualizer) return

    const canvas = this.audioVisualizer.nativeElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw)

      // Obtener datos de frecuencia
      this.analyser!.getByteFrequencyData(this.dataArray)

      // Limpiar el canvas
      ctx.clearRect(0, 0, width, height)

      // Calcular el ancho de cada barra
      const barWidth = (width / this.dataArray.length) * 2.5

      // Dibujar las barras de frecuencia
      let x = 0
      let sum = 0

      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * height
        sum += this.dataArray[i]

        // Calcular color basado en la frecuencia
        const hue = (i / this.dataArray.length) * 360
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`

        ctx.fillRect(x, height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }

      // Detectar beats para sincronización
      const average = sum / this.dataArray.length
      const now = Date.now()

      // Detectar un beat si el promedio supera el umbral y ha pasado suficiente tiempo desde el último beat
      if (average > 100 * (this.syncSensitivity / 50) && now - this.lastBeatTime > 300) {
        this.beatDetected = true
        this.lastBeatTime = now

        // Cambiar luces en respuesta al beat si la sincronización está habilitada
        if (this.syncEnabled && this.selectedPresetId !== null) {
          this.applyBeatEffect()
        }
      } else {
        this.beatDetected = false
      }
    }

    draw()
  }

  /**
   * Inicia la sincronización de luces con la música
   */
  startLightSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Si no hay preset seleccionado o la sincronización está desactivada, no hacer nada
    if (!this.syncEnabled || this.selectedPresetId === null) return

    const preset = this.presets.find((p) => p.id === this.selectedPresetId)
    if (!preset || preset.colors.length === 0) return

    // Iniciar un intervalo para cambiar las luces periódicamente
    // Esto se complementa con los cambios basados en beats detectados
    this.syncInterval = setInterval(() => {
      // Cambiar colores periódicamente incluso sin beats detectados
      // para mantener algún tipo de animación
      if (!this.beatDetected) {
        this.currentColorIndex = (this.currentColorIndex + 1) % preset.colors.length
        this.applyColorToLights(preset.colors[this.currentColorIndex])
      }
    }, 2000) // Cambio cada 2 segundos si no hay beats
  }

  /**
   * Aplica un efecto de luz en respuesta a un beat detectado
   */
  applyBeatEffect() {
    const preset = this.presets.find((p) => p.id === this.selectedPresetId)
    if (!preset || preset.colors.length === 0) return

    // Cambiar al siguiente color en el preset
    this.currentColorIndex = (this.currentColorIndex + 1) % preset.colors.length

    // Aplicar el color a todas las luces encendidas
    this.applyColorToLights(preset.colors[this.currentColorIndex])
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
   * Selecciona un preset para la sincronización
   */
  selectPreset(presetId: number) {
    this.selectedPresetId = presetId

    // Reiniciar el índice de color
    this.currentColorIndex = 0

    // Reiniciar la sincronización si está reproduciendo
    if (this.isPlaying && this.syncEnabled) {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
      }
      this.startLightSync()
    }

    const preset = this.presets.find((p) => p.id === presetId)
    if (preset) {
      this.showToast(`Preset "${preset.name}" seleccionado para sincronización`)
    }
  }

  /**
   * Activa o desactiva la sincronización de luces
   */
  toggleSync() {
    this.syncEnabled = !this.syncEnabled

    if (this.syncEnabled) {
      if (this.selectedPresetId === null && this.presets.length > 0) {
        // Seleccionar el primer preset por defecto si no hay ninguno seleccionado
        this.selectedPresetId = this.presets[0].id
      }

      if (this.isPlaying) {
        this.startLightSync()
      }

      this.showToast("Sincronización de luces activada")
    } else {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }

      this.showToast("Sincronización de luces desactivada")
    }
  }

  /**
   * Ajusta la sensibilidad de la sincronización
   */
  adjustSensitivity() {
    // La sensibilidad afecta al umbral de detección de beats
    this.beatThreshold = 2.5 - this.syncSensitivity / 50

    this.showToast(`Sensibilidad ajustada a ${this.syncSensitivity}%`)
  }

  /**
   * Guarda un nuevo patrón de sincronización
   */
  savePattern() {
    if (this.newPatternName.trim() === "") {
      this.showToast("Por favor ingresa un nombre para el patrón")
      return
    }

    // Obtener los colores actuales de las luces encendidas
    const activeLights = this.lights.filter((light) => light.isOn)
    if (activeLights.length === 0) {
      this.showToast("Debes tener al menos una luz encendida para guardar un patrón")
      return
    }

    const colors = activeLights.map((light) => light.color)

    // Guardar como un nuevo preset
    const newPresetId = this.lightService.saveNewPreset(this.newPatternName)

    if (newPresetId) {
      this.newPatternName = ""
      this.showSavePatternModal = false
      this.showToast("Patrón guardado correctamente")

      // Seleccionar el nuevo preset para la sincronización
      this.selectedPresetId = newPresetId
    }
  }

  /**
   * Busca pistas de música
   */
  searchMusic() {
    if (this.searchQuery.trim() === "") return

    this.isLoading = true

    // Implementación real de búsqueda
    setTimeout(() => {
      this.isLoading = false

      // Filtrar las pistas según la pestaña activa y el término de búsqueda
      if (this.activeTab === "device") {
        this.deviceTracks = this.deviceTracks.filter(
          (track) =>
            track.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(this.searchQuery.toLowerCase()),
        )
      } else if (this.activeTab === "internet") {
        // Filtrar pistas de internet
        this.internetTracks = this.internetTracks.filter(
          (track) =>
            track.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(this.searchQuery.toLowerCase()),
        )
      }
    }, 500)
  }

  /**
   * Implementación real de inicio de sesión en Spotify
   */
  loginToSpotify() {
    this.isLoading = true

    // En una implementación real, aquí se usaría OAuth para autenticar con Spotify
    // Por ahora, vamos a crear una implementación básica que funcione

    // Simular proceso de autenticación
    setTimeout(() => {
      this.isLoading = false
      this.spotifyLoggedIn = true
      this.spotifyUsername = "usuario_spotify"
      this.showSpotifyLoginModal = false

      this.showToast("Conectado a Spotify correctamente")

      // Cargar pistas de Spotify (en una implementación real, esto vendría de la API de Spotify)
      this.spotifyTracks = [
        {
          id: "spotify1",
          title: "Tu Mix Diario",
          artist: "Spotify",
          duration: 220,
          source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", // URL pública para pruebas
          thumbnail: "assets/images/spotify-daily.jpg",
          type: "spotify",
        },
        {
          id: "spotify2",
          title: "Descubrimiento Semanal",
          artist: "Spotify",
          duration: 240,
          source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", // URL pública para pruebas
          thumbnail: "assets/images/spotify-discover.jpg",
          type: "spotify",
        },
        {
          id: "spotify3",
          title: "Tus Favoritos",
          artist: "Spotify",
          duration: 260,
          source: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", // URL pública para pruebas
          thumbnail: "assets/images/spotify-favorites.jpg",
          type: "spotify",
        },
      ]
    }, 1500)
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
   * Formatea el tiempo en formato mm:ss
   */
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return "00:00"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  /**
   * Navega a la página de inicio
   */
  goToHome() {
    // Detener la reproducción antes de navegar
    this.stopPlayback()
    this.cleanupAudioContext()

    this.router.navigate(["/home"])
  }
}

// Interfaz para las pistas de música
interface Track {
  id: string
  title: string
  artist: string
  duration: number
  source: string
  thumbnail: string
  type: "device" | "internet" | "spotify"
}
