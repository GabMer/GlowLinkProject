import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"
import type { AudioData } from "../models/light.model"

@Injectable({
  providedIn: "root",
})
export class AudioAnalysisService {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private isListening = false

  private audioDataSubject = new BehaviorSubject<AudioData>({
    volume: 0,
    frequency: 0,
    bpm: 0,
    dominantFrequency: 0,
    frequencies: [],
    timestamp: 0,
  })

  public audioData$: Observable<AudioData> = this.audioDataSubject.asObservable()

  constructor() {}

  async startListening(): Promise<void> {
    try {
      if (this.isListening) {
        return
      }

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(stream)

      // Configurar el analizador
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8

      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)

      // Conectar el micrófono al analizador
      this.microphone.connect(this.analyser)

      this.isListening = true
      this.analyzeAudio()

      console.log("Audio analysis started")
    } catch (error) {
      console.error("Error starting audio analysis:", error)
      throw error
    }
  }

  stopListening(): void {
    if (!this.isListening) {
      return
    }

    this.isListening = false

    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.analyser = null
    this.dataArray = null

    console.log("Audio analysis stopped")
  }

  private analyzeAudio(): void {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return
    }

    // Obtener datos de frecuencia
    this.analyser.getByteFrequencyData(this.dataArray)

    // Calcular volumen promedio
    const volume = this.calculateVolume(this.dataArray)

    // Encontrar frecuencia dominante
    const dominantFrequency = this.findDominantFrequency(this.dataArray)

    // Calcular BPM (simplificado)
    const bpm = this.estimateBPM(volume)

    // Crear array de frecuencias para visualización
    const frequencies = Array.from(this.dataArray)

    // Emitir datos de audio
    const audioData: AudioData = {
      volume,
      frequency: dominantFrequency,
      bpm,
      dominantFrequency,
      frequencies,
      timestamp: Date.now(),
    }

    this.audioDataSubject.next(audioData)

    // Continuar el análisis
    requestAnimationFrame(() => this.analyzeAudio())
  }

  private calculateVolume(dataArray: Uint8Array): number {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    return sum / dataArray.length / 255 // Normalizar a 0-1
  }

  private findDominantFrequency(dataArray: Uint8Array): number {
    let maxIndex = 0
    let maxValue = 0

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i]
        maxIndex = i
      }
    }

    // Convertir índice a frecuencia
    const nyquist = (this.audioContext?.sampleRate || 44100) / 2
    return (maxIndex / dataArray.length) * nyquist
  }

  private estimateBPM(volume: number): number {
    // Implementación simplificada de detección de BPM
    // En una implementación real, necesitarías un algoritmo más sofisticado
    const threshold = 0.3
    if (volume > threshold) {
      // Simular detección de beat
      return Math.floor(Math.random() * 60) + 80 // BPM entre 80-140
    }
    return 0
  }

  getCurrentAudioData(): AudioData {
    return this.audioDataSubject.getValue()
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }
}