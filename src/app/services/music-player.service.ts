import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import type { Platform } from "@ionic/angular"
import type { MusicFile } from "./music-file.service"

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
    private audioElement: HTMLAudioElement | null = null
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

    constructor(private platform: Platform) {
        this.initAudioElement()
    }

    /**
     * Inicializa el elemento de audio
     */
    private initAudioElement(): void {
        if (typeof Audio !== "undefined") {
            this.audioElement = new Audio()

            // Configurar eventos
            this.audioElement.onplay = () => this.updateStatus({ isPlaying: true })
            this.audioElement.onpause = () => this.updateStatus({ isPlaying: false })
            this.audioElement.onended = () => {
                this.updateStatus({ isPlaying: false, currentTime: 0 })
                this.stopUpdateInterval()
            }
            this.audioElement.onloadedmetadata = () => {
                if (this.audioElement) {
                    this.updateStatus({ duration: this.audioElement.duration })
                }
            }
            this.audioElement.onerror = (e) => {
                console.error("Error de audio:", e)
                this.updateStatus({ isPlaying: false })
                this.stopUpdateInterval()
            }
        }
    }

    /**
     * Reproduce un archivo de música
     */
    async playFile(file: MusicFile): Promise<boolean> {
        await this.platform.ready()

        // Detener reproducción actual si existe
        this.stopPlayback()

        try {
            if (!this.audioElement) {
                this.initAudioElement()
            }

            if (!this.audioElement) {
                console.error("No se pudo crear el elemento de audio")
                return false
            }

            console.log(`Reproduciendo: ${file.path}`)
            this.audioElement.src = file.path
            this.audioElement.load()

            // Iniciar reproducción
            await this.audioElement.play()
            this.currentFileSubject.next(file)
            this.updateStatus({ isPlaying: true })

            // Iniciar intervalo para actualizar la posición
            this.startUpdateInterval()

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
        if (!this.audioElement) return false

        const currentStatus = this.statusSubject.getValue()

        if (currentStatus.isPlaying) {
            this.audioElement.pause()
            this.updateStatus({ isPlaying: false })
            this.stopUpdateInterval()
        } else {
            this.audioElement
                .play()
                .then(() => {
                    this.updateStatus({ isPlaying: true })
                    this.startUpdateInterval()
                })
                .catch((err) => {
                    console.error("Error al reanudar reproducción:", err)
                })
        }

        return true
    }

    /**
     * Detiene la reproducción
     */
    stopPlayback(): void {
        if (this.audioElement) {
            this.audioElement.pause()
            this.audioElement.currentTime = 0
        }

        this.currentFileSubject.next(null)
        this.updateStatus({
            isPlaying: false,
            currentTime: 0,
        })

        this.stopUpdateInterval()
    }

    /**
     * Ajusta el volumen (0.0 - 1.0)
     */
    setVolume(volume: number): void {
        if (!this.audioElement) return

        // Asegurar que el volumen esté entre 0 y 1
        const safeVolume = Math.max(0, Math.min(1, volume))
        this.audioElement.volume = safeVolume
        this.updateStatus({ volume: safeVolume })
    }

    /**
     * Busca una posición específica en segundos
     */
    seekTo(position: number): void {
        if (!this.audioElement) return

        this.audioElement.currentTime = position
        this.updateStatus({ currentTime: position })
    }

    /**
     * Inicia un intervalo para actualizar la posición actual
     */
    private startUpdateInterval(): void {
        this.stopUpdateInterval()

        this.updateInterval = setInterval(() => {
            if (!this.audioElement) return

            this.updateStatus({
                currentTime: this.audioElement.currentTime,
                duration: this.audioElement.duration || 0,
            })
        }, 1000)
    }

    /**
     * Detiene el intervalo de actualización
     */
    private stopUpdateInterval(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval)
            this.updateInterval = null
        }
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
