import { Injectable } from "@angular/core"
import { Media, MediaObject } from "@awesome-cordova-plugins/media/ngx"
import { BehaviorSubject } from "rxjs"
import { Platform } from "@ionic/angular"
import { MusicFile } from "./music-file.service"

export interface PlaybackStatus {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
}

@Injectable({
  providedIn: "root",
})
export class MusicPlayerService {
  private mediaObject: MediaObject | null = null
  private statusSubject = new BehaviorSubject<PlaybackStatus>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0,
  })
  public status$ = this.statusSubject.asObservable()

  private currentFileSubject = new BehaviorSubject<MusicFile | null>(null)
  public currentFile$ = this.currentFileSubject.asObservable()

  private updateInterval: any = null

  constructor(
    private media: Media,
    private platform: Platform,
  ) {}

  /**
   * Reproduce un archivo de música
   */
  async playFile(file: MusicFile): Promise<boolean> {
    await this.platform.ready()

    // Detener reproducción actual si existe
    this.stopPlayback()

    try {
      console.log(`Reproduciendo: ${file.path}`)
      this.mediaObject = this.media.create(file.path)

      // Manejar eventos del reproductor
      this.mediaObject.onStatusUpdate.subscribe((status) => {
        console.log(`Estado del reproductor: ${status}`)
        // Media.MEDIA_STARTING = 1
        // Media.MEDIA_RUNNING = 2
        // Media.MEDIA_PAUSED = 3
        // Media.MEDIA_STOPPED = 4
        const isPlaying = status === 2
        this.updateStatus({ isPlaying })
      })

      this.mediaObject.onSuccess.subscribe(() => {
        console.log("Reproducción completada con éxito")
        this.stopPlayback()
      })

      this.mediaObject.onError.subscribe((error) => {
        console.error("Error en la reproducción:", error)
        this.stopPlayback()
      })

      // Iniciar reproducción
      this.mediaObject.play()
      this.currentFileSubject.next(file)
      this.updateStatus({ isPlaying: true })

      // Iniciar intervalo para actualizar la posición
      this.startPositionUpdateInterval()

      return true
    } catch (error) {
      console.error("Error al reproducir archivo:", error)
      return false
    }
  }

  /**
   * Pausa o reanuda la reproducción
   */
  togglePlayback(): boolean {
    if (!this.mediaObject) return false

    const currentStatus = this.statusSubject.getValue()

    if (currentStatus.isPlaying) {
      this.mediaObject.pause()
      this.updateStatus({ isPlaying: false })
    } else {
      this.mediaObject.play()
      this.updateStatus({ isPlaying: true })
    }

    return true
  }

  /**
   * Detiene la reproducción
   */
  stopPlayback(): void {
    if (this.mediaObject) {
      this.mediaObject.stop()
      this.mediaObject.release()
      this.mediaObject = null
    }

    this.currentFileSubject.next(null)
    this.updateStatus({
      isPlaying: false,
      currentTime: 0,
    })

    // Detener intervalo de actualización
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Ajusta el volumen (0.0 - 1.0)
   */
  setVolume(volume: number): void {
    if (!this.mediaObject) return

    // Asegurar que el volumen esté entre 0 y 1
    const safeVolume = Math.max(0, Math.min(1, volume))
    this.mediaObject.setVolume(safeVolume)
    this.updateStatus({ volume: safeVolume })
  }

  /**
   * Busca una posición específica en segundos
   */
  seekTo(position: number): void {
    if (!this.mediaObject) return

    this.mediaObject.seekTo(position * 1000) // Convertir a milisegundos
    this.updateStatus({ currentTime: position })
  }

  /**
   * Inicia un intervalo para actualizar la posición actual
   */
  private startPositionUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(() => {
      if (!this.mediaObject) return

      // Obtener posición actual
      this.mediaObject.getCurrentPosition().then((position) => {
        if (position >= 0) {
          this.updateStatus({ currentTime: position })
        }
      })

      // Obtener duración
      const duration = this.mediaObject.getDuration()
      if (duration > 0) {
        this.updateStatus({ duration })
      }
    }, 1000)
  }

  /**
   * Actualiza el estado de reproducción
   */
  private updateStatus(updates: Partial<PlaybackStatus>): void {
    const currentStatus = this.statusSubject.getValue()
    this.statusSubject.next({
      ...currentStatus,
      ...updates,
    })
  }
}
