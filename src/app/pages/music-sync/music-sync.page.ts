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
import { MusicFileService } from "../../services/music-file.service"
import { YouTubeService } from "../../services/youtube.service"
import { SpotifyService } from "../../services/spotify.service"
import { FilterByPipe } from "../../pipes/filter-by.pipe"
import { IonContent } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { HttpClientModule } from '@angular/common/http';
import { logoYoutube } from 'ionicons/icons';
import { IonicModule, ToastController, LoadingController, AlertController } from "@ionic/angular"
import { addIcons } from "ionicons"
import {
  musicalNoteOutline,
  musicalNote,
  playOutline,
  pauseOutline,
  stopOutline,
  volumeHighOutline,
  volumeMuteOutline,
  cloudDownloadOutline,
  folderOpenOutline,
  colorWandOutline,
  arrowBack,
  closeOutline,
  saveOutline,
  addOutline,
  checkmarkOutline,
  bluetoothOutline,
  bluetooth,
  searchOutline,
  refreshOutline,
  logOutOutline,
  arrowForward,
} from "ionicons/icons"

interface Track {
  id: string
  title: string
  artist: string
  duration: number
  source: string
  thumbnail: string
  type: "device" | "youtube" | "spotify"
  originalData?: any
}

@Component({
  selector: "app-music-sync",
  templateUrl: "./music-sync.page.html",
  styleUrls: ["./music-sync.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FilterByPipe, HttpClientModule],
  providers: [YouTubeService, SpotifyService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class MusicSyncPage implements OnInit, OnDestroy {
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLAudioElement>
  @ViewChild("audioVisualizer") audioVisualizer!: ElementRef<HTMLCanvasElement>
  @ViewChild(IonContent) content!: IonContent

  // Datos del componente
  lights: Light[] = []
  presets: Preset[] = []
  bluetoothConnected = false
  userEmail: string | null = null

  // Estados de UI
  activeTab = "device" // device, youtube, spotify
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
  showCreateRoomModal = false

  // Datos de música
  deviceTracks: Track[] = []
  youtubeTracks: Track[] = []
  spotifyTracks: Track[] = []
  currentTrack: Track | null = null

  // Estados de servicios
  spotifyAuthenticated = false
  spotifyUserProfile: any = null

  // Análisis de audio
  audioContext: AudioContext | null = null
  analyser: AnalyserNode | null = null
  dataArray: Uint8Array = new Uint8Array()
  source: MediaElementAudioSourceNode | null = null
  animationFrameId: number | null = null
  beatDetected = false
  lastBeatTime = 0
  beatThreshold = 1.5

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
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private authService: AuthService,
    private settingsService: SettingsService,
    private musicFileService: MusicFileService,
    private youtubeService: YouTubeService,
    private spotifyService: SpotifyService,
  ) {
    // Registrar los iconos
    addIcons({
      "musical-note-outline": musicalNoteOutline,
      "musical-note": musicalNote,
      "play-outline": playOutline,
      "pause-outline": pauseOutline,
      "stop-outline": stopOutline,
      "volume-high-outline": volumeHighOutline,
      "volume-mute-outline": volumeMuteOutline,
      "cloud-download-outline": cloudDownloadOutline,
      "folder-open-outline": folderOpenOutline,
      "color-wand-outline": colorWandOutline,
      "arrow-back": arrowBack,
      "close-outline": closeOutline,
      "save-outline": saveOutline,
      "add-outline": addOutline,
      "checkmark-outline": checkmarkOutline,
      "bluetooth-outline": bluetoothOutline,
      bluetooth: bluetooth,
      "search-outline": searchOutline,
      "refresh-outline": refreshOutline,
      "log-out-outline": logOutOutline,
      "arrow-forward": arrowForward,
      'logo-youtube': logoYoutube
    })
  }

  ngOnInit() {
    this.initializeComponent()
    this.loadInitialMusic()
  }

  ngAfterViewInit() {
    this.initAudioContext()
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.stopPlayback()
    this.cleanupAudioContext()
  }

  /**
   * Inicializa el componente y las suscripciones
   */
  private initializeComponent(): void {
    // Obtener información del usuario actual
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.userEmail = user?.email ?? null
      }),

      this.lightService.lights$.subscribe((lights) => {
        this.lights = lights
      }),

      this.lightService.presets$.subscribe((presets) => {
        this.presets = presets
      }),

      this.bluetoothService.connectionStatus$.subscribe((status) => {
        this.bluetoothConnected = status
      }),

      this.settingsService.sensitivityMode$.subscribe((enabled) => {
        this.sensitivityModeEnabled = enabled
        this.applyVisualSettings()

        if (enabled) {
          this.syncSensitivity = 30
          this.beatThreshold = 2.0
        } else {
          this.syncSensitivity = 50
          this.beatThreshold = 1.5
        }
      }),

      // Suscribirse al estado de autenticación de Spotify
      this.spotifyService.authStatus$.subscribe((isAuth) => {
        this.spotifyAuthenticated = isAuth
      }),

      this.spotifyService.userProfile$.subscribe((profile) => {
        this.spotifyUserProfile = profile
      }),
    )
  }

  /**
   * Carga la música inicial
   */
  private async loadInitialMusic(): Promise<void> {
    // Cargar archivos del dispositivo
    await this.loadDeviceMusic()
  }

  /**
   * Carga archivos de música del dispositivo
   */
  private async loadDeviceMusic(): Promise<void> {
    try {
      const loading = await this.loadingController.create({
        message: "Buscando música...",
        duration: 5000,
      })
      await loading.present()

      const musicFiles = await this.musicFileService.searchMusicFiles()
      this.deviceTracks = musicFiles.map((file) => ({
        id: file.id,
        title: file.title,
        artist: file.artist,
        duration: file.duration,
        source: file.path,
        thumbnail: file.thumbnail,
        type: "device" as const,
        originalData: file,
      }))

      await loading.dismiss()
    } catch (error) {
      console.error("Error cargando música del dispositivo:", error)
      this.showToast("Error al acceder a los archivos de música del dispositivo")
    }
  }

  /**
   * Cambia la pestaña activa
   */
  changeTab(tab: string) {
    this.activeTab = tab
    this.searchQuery = "" // Limpiar búsqueda al cambiar de pestaña

    if (this.isPlaying) {
      this.stopPlayback()
    }

    // Si seleccionamos Spotify y no está autenticado, mostrar modal de login
    if (tab === "spotify" && !this.spotifyAuthenticated) {
      this.showSpotifyLoginModal = true
    }
  }

  /**
   * Busca música según la pestaña activa
   */
  async searchMusic(): Promise<void> {
    if (!this.searchQuery.trim()) {
      // Si no hay búsqueda, mostrar contenido por defecto
      if (this.activeTab === "device") {
        await this.loadDeviceMusic()
      }
      return
    }

    this.isLoading = true

    try {
      switch (this.activeTab) {
        case "device":
          this.searchDeviceMusic()
          break
        case "youtube":
          await this.searchYouTubeMusic()
          break
        case "spotify":
          await this.searchSpotifyMusic()
          break
      }
    } catch (error) {
      console.error("Error en búsqueda:", error)
      this.showToast("Error en la búsqueda. Inténtalo de nuevo.")
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Busca en archivos del dispositivo
   */
  private searchDeviceMusic(): void {
    const filteredFiles = this.musicFileService.searchFiles(this.searchQuery)
    this.deviceTracks = filteredFiles.map((file) => ({
      id: file.id,
      title: file.title,
      artist: file.artist,
      duration: file.duration,
      source: file.path,
      thumbnail: file.thumbnail,
      type: "device" as const,
      originalData: file,
    }))
  }

  /**
   * Busca en YouTube
   */
  private async searchYouTubeMusic(): Promise<void> {
    try {
      const videos = await this.youtubeService.searchMusic(this.searchQuery).toPromise()
      this.youtubeTracks =
        videos?.map((video) => ({
          id: video.id,
          title: video.title,
          artist: video.artist,
          duration: video.duration,
          source: video.url,
          thumbnail: video.thumbnail,
          type: "youtube" as const,
          originalData: video,
        })) || []
    } catch (error) {
      console.error("Error buscando en YouTube:", error)
      this.showToast("Error al buscar en YouTube. Verifica tu conexión.")
    }
  }

  /**
   * Busca en Spotify
   */
  private async searchSpotifyMusic(): Promise<void> {
    if (!this.spotifyAuthenticated) {
      this.showSpotifyLoginModal = true
      return
    }

    try {
      const tracks = await this.spotifyService.searchTracks(this.searchQuery).toPromise()
      this.spotifyTracks =
        tracks?.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          source: track.previewUrl || track.externalUrl,
          thumbnail: track.thumbnail,
          type: "spotify" as const,
          originalData: track,
        })) || []
    } catch (error) {
      console.error("Error buscando en Spotify:", error)
      this.showToast("Error al buscar en Spotify. Inténtalo de nuevo.")
    }
  }

  /**
   * Selecciona una pista para reproducir
   */
  async selectTrack(track: Track): Promise<void> {
    if (this.isPlaying) {
      this.stopPlayback()
    }

    this.currentTrack = track

    // Casos especiales según el tipo
    if (track.type === "spotify" && !track.originalData?.previewUrl) {
      await this.showAlert(
        "Información",
        "Esta pista de Spotify no tiene vista previa disponible. Se abrirá en Spotify.",
      )
      window.open(track.source, "_system")
      return
    }

    if (track.type === "youtube") {
      await this.showAlert("Información", "Para reproducir desde YouTube, se abrirá en el navegador.")
      window.open(track.source, "_system")
      return
    }

    // Preparar el reproductor de audio para archivos locales o previews de Spotify
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.src = track.source
      this.audioPlayer.nativeElement.load()

      // Iniciar la reproducción automáticamente
      setTimeout(() => {
        this.playPause()
      }, 100)
    }
  }

  /**
   * Inicia o pausa la reproducción
   */
  async playPause(): Promise<void> {
    if (!this.currentTrack) {
      this.showToast("Selecciona una canción primero")
      return
    }

    if (!this.audioPlayer?.nativeElement) {
      this.showToast("Error: Reproductor no disponible")
      return
    }

    try {
      if (this.isPlaying) {
        this.audioPlayer.nativeElement.pause()
        this.isPlaying = false
        this.stopVisualization()
      } else {
        // Reanudar el contexto de audio si está suspendido
        if (this.audioContext?.state === "suspended") {
          await this.audioContext.resume()
        }

        await this.audioPlayer.nativeElement.play()
        this.isPlaying = true
        this.startVisualization()
        this.startLightSync()
      }
    } catch (error) {
      console.error("Error al reproducir audio:", error)
      this.showToast("No se pudo reproducir la pista de audio.")
    }
  }

  /**
   * Detiene la reproducción
   */
  stopPlayback(): void {
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.pause()
      this.audioPlayer.nativeElement.currentTime = 0
      this.isPlaying = false
      this.stopVisualization()
    }
  }

  /**
   * Actualiza el volumen
   */
  updateVolume(): void {
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.volume = this.volume / 100
    }
  }

  /**
   * Silencia o activa el sonido
   */
  toggleMute(): void {
    if (this.audioPlayer?.nativeElement) {
      this.isMuted = !this.isMuted
      this.audioPlayer.nativeElement.muted = this.isMuted
    }
  }

  /**
   * Actualiza el tiempo de reproducción
   */
  updateTime(): void {
    if (this.audioPlayer?.nativeElement) {
      this.currentTime = this.audioPlayer.nativeElement.currentTime
      this.duration = this.audioPlayer.nativeElement.duration || 0
    }
  }

  /**
   * Cambia la posición de reproducción
   */
  seekTo(event: any): void {
    if (this.audioPlayer?.nativeElement) {
      const newTime = event.detail.value
      this.audioPlayer.nativeElement.currentTime = newTime
    }
  }

  /**
   * Autenticación con Spotify
   */
  async loginToSpotify(): Promise<void> {
    const loading = await this.loadingController.create({
      message: "Conectando con Spotify...",
    })
    await loading.present()

    try {
      // Para desarrollo, simular autenticación exitosa
      // En producción, usar this.spotifyService.authenticate()
      setTimeout(async () => {
        await this.spotifyService.getClientCredentialsToken().toPromise()

        // Simular datos de usuario
        this.spotifyAuthenticated = true
        this.spotifyUserProfile = {
          display_name: "Usuario Demo",
          email: "demo@spotify.com",
        }

        this.showSpotifyLoginModal = false
        await loading.dismiss()
        this.showToast("Conectado a Spotify correctamente")

        // Cargar contenido inicial de Spotify
        await this.loadSpotifyContent()
      }, 1500)
    } catch (error) {
      await loading.dismiss()
      console.error("Error conectando con Spotify:", error)
      this.showToast("Error al conectar con Spotify")
    }
  }

  /**
   * Carga contenido inicial de Spotify
   */
  private async loadSpotifyContent(): Promise<void> {
    try {
      // Buscar música popular por defecto
      const tracks = await this.spotifyService.searchTracks("top hits 2024").toPromise()
      this.spotifyTracks =
        tracks?.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          source: track.previewUrl || track.externalUrl,
          thumbnail: track.thumbnail,
          type: "spotify" as const,
          originalData: track,
        })) || []
    } catch (error) {
      console.error("Error cargando contenido de Spotify:", error)
    }
  }

  /**
   * Cerrar sesión de Spotify
   */
  logoutSpotify(): void {
    this.spotifyService.logout()
    this.spotifyTracks = []
    this.showToast("Sesión de Spotify cerrada")
  }

  /**
   * Muestra el modal para crear una sala
   */
  showCreateRoom(): void {
    this.showCreateRoomModal = true
  }

  /**
   * Desplaza al inicio de la página
   */
  scrollToTop(): void {
    this.content.scrollToTop(500)
  }

  // Resto de métodos de sincronización y visualización (mantener los existentes)
  applyVisualSettings(): void {
    if (this.sensitivityModeEnabled) {
      document.body.classList.add("sensitivity-mode")
    } else {
      document.body.classList.remove("sensitivity-mode")
    }
  }

  initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)

      if (this.audioPlayer?.nativeElement) {
        this.source = this.audioContext.createMediaElementSource(this.audioPlayer.nativeElement)
        this.source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
      }
    } catch (error) {
      console.error("Error al inicializar el contexto de audio:", error)
    }
  }

  cleanupAudioContext(): void {
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

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  startVisualization(): void {
    if (!this.analyser || !this.audioVisualizer) return

    const canvas = this.audioVisualizer.nativeElement
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw)

      this.analyser!.getByteFrequencyData(this.dataArray)
      ctx.clearRect(0, 0, width, height)

      const barWidth = (width / this.dataArray.length) * 2.5
      let x = 0
      let sum = 0

      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * height
        sum += this.dataArray[i]

        const hue = (i / this.dataArray.length) * 360
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }

      const average = sum / this.dataArray.length
      const now = Date.now()

      if (average > 100 * (this.syncSensitivity / 50) && now - this.lastBeatTime > 300) {
        this.beatDetected = true
        this.lastBeatTime = now

        if (this.syncEnabled && this.selectedPresetId !== null) {
          this.applyBeatEffect()
        }
      } else {
        this.beatDetected = false
      }
    }

    draw()
  }

  stopVisualization(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  startLightSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    if (!this.syncEnabled || this.selectedPresetId === null) return

    const preset = this.presets.find((p) => p.id === this.selectedPresetId)
    if (!preset || preset.colors.length === 0) return

    this.syncInterval = setInterval(() => {
      if (!this.beatDetected) {
        this.currentColorIndex = (this.currentColorIndex + 1) % preset.colors.length
        this.applyColorToLights(preset.colors[this.currentColorIndex])
      }
    }, 2000)
  }

  applyBeatEffect(): void {
    const preset = this.presets.find((p) => p.id === this.selectedPresetId)
    if (!preset || preset.colors.length === 0) return

    this.currentColorIndex = (this.currentColorIndex + 1) % preset.colors.length
    this.applyColorToLights(preset.colors[this.currentColorIndex])
  }

  applyColorToLights(color: string): void {
    const lights = this.lightService.getLights()
    const updatedLights = lights.map((light) => {
      if (light.isOn) {
        const rgb = this.hexToRgb(color)
        return { ...light, color, rgb }
      }
      return light
    })

    this.lightService.lightsSubject.next(updatedLights)

    if (this.bluetoothConnected) {
      this.bluetoothService.sendData({
        type: "colorChange",
        color: color,
      })
    }
  }

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

  selectPreset(presetId: number): void {
    this.selectedPresetId = presetId
    this.currentColorIndex = 0

    if (this.isPlaying && this.syncEnabled) {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
      }
      this.startLightSync()
    }

    const preset = this.presets.find((p) => p.id === presetId)
    if (preset) {
      this.showToast(`Preset "${preset.name}" seleccionado`)
    }
  }

  toggleSync(): void {
    this.syncEnabled = !this.syncEnabled

    if (this.syncEnabled) {
      if (this.selectedPresetId === null && this.presets.length > 0) {
        this.selectedPresetId = this.presets[0].id
      }

      if (this.isPlaying) {
        this.startLightSync()
      }

      this.showToast("Sincronización activada")
    } else {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }

      this.showToast("Sincronización desactivada")
    }
  }

  adjustSensitivity(): void {
    this.beatThreshold = 2.5 - this.syncSensitivity / 50
    this.showToast(`Sensibilidad ajustada a ${this.syncSensitivity}%`)
  }

  savePattern(): void {
    if (this.newPatternName.trim() === "") {
      this.showToast("Ingresa un nombre para el patrón")
      return
    }

    const activeLights = this.lights.filter((light) => light.isOn)
    if (activeLights.length === 0) {
      this.showToast("Debes tener al menos una luz encendida")
      return
    }

    const newPresetId = this.lightService.saveNewPreset(this.newPatternName)

    if (newPresetId) {
      this.newPatternName = ""
      this.showSavePatternModal = false
      this.showToast("Patrón guardado correctamente")
      this.selectedPresetId = newPresetId
    }
  }

  // Métodos auxiliares
  async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
    })
    await toast.present()
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["OK"],
    })
    await alert.present()
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return "00:00"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  goToHome(): void {
    this.stopPlayback()
    this.cleanupAudioContext()
    this.router.navigate(["/home"])
  }

  // Método para obtener las pistas según la pestaña activa
  getCurrentTracks(): Track[] {
    switch (this.activeTab) {
      case "device":
        return this.deviceTracks
      case "youtube":
        return this.youtubeTracks
      case "spotify":
        return this.spotifyTracks
      default:
        return []
    }
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    const img = event.target
    const title = img.alt || "Música"

    // Crear un SVG de respaldo
    const svg = `
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#defaultGrad)" rx="8"/>
        <circle cx="40" cy="35" r="12" fill="white" opacity="0.8"/>
        <polygon points="35,30 35,40 45,35" fill="#667eea"/>
        <text x="40" y="60" font-family="Arial, sans-serif" font-size="10" 
              text-anchor="middle" fill="white">♪</text>
      </svg>
    `

    img.src = `data:image/svg+xml;base64,${btoa(svg)}`
  }
}
