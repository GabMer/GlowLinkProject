import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"
import { type Light, type LightEffect, LightMode } from "../models/light.model"

@Injectable({
  providedIn: "root",
})
export class LightService {
  private lights: Light[] = [
    {
      id: "light1",
      name: "Luz Principal",
      connected: true,
      brightness: 80,
      color: "#ff0000",
      effects: ["pulse", "fade", "strobe"],
      selectedEffect: "pulse",
    },
    {
      id: "light2",
      name: "Luz Secundaria",
      connected: true,
      brightness: 70,
      color: "#ff3300",
      effects: ["pulse", "fade", "strobe"],
      selectedEffect: "fade",
    },
    {
      id: "light3",
      name: "Luz Ambiental",
      connected: false,
      brightness: 50,
      color: "#ff6600",
      effects: ["pulse", "fade", "strobe"],
    },
  ]

  private availableEffects: LightEffect[] = [
    {
      id: "pulse",
      name: "Pulso",
      description: "Efecto de pulso suave",
      colors: ["#ff0000", "#000000"],
      speed: 2,
      intensity: 7,
    },
    {
      id: "fade",
      name: "Desvanecimiento",
      description: "Transición suave entre colores",
      colors: ["#ff0000", "#ff3300", "#ff6600"],
      speed: 3,
      intensity: 5,
    },
    {
      id: "strobe",
      name: "Estroboscópico",
      description: "Efecto de flash rápido",
      colors: ["#ff0000", "#ffffff"],
      speed: 8,
      intensity: 10,
    },
    {
      id: "wave",
      name: "Onda",
      description: "Efecto de onda de color",
      colors: ["#ff0000", "#990000", "#ff3300"],
      speed: 4,
      intensity: 6,
    },
  ]

  private selectedMode = new BehaviorSubject<LightMode>(LightMode.DEFAULT)
  private connectedLights = new BehaviorSubject<Light[]>([])

  constructor() {
    // Inicializar luces conectadas
    this.updateConnectedLights()
  }

  private updateConnectedLights(): void {
    const connected = this.lights.filter((light) => light.connected)
    this.connectedLights.next(connected)
  }

  getLights(): Light[] {
    return [...this.lights]
  }

  getConnectedLights(): Observable<Light[]> {
    return this.connectedLights.asObservable()
  }

  getLight(id: string): Light | undefined {
    return this.lights.find((light) => light.id === id)
  }

  getAvailableEffects(): LightEffect[] {
    return [...this.availableEffects]
  }

  getEffect(id: string): LightEffect | undefined {
    return this.availableEffects.find((effect) => effect.id === id)
  }

  connectLight(id: string): void {
    const light = this.lights.find((l) => l.id === id)
    if (light) {
      light.connected = true
      this.updateConnectedLights()
    }
  }

  disconnectLight(id: string): void {
    const light = this.lights.find((l) => l.id === id)
    if (light) {
      light.connected = false
      this.updateConnectedLights()
    }
  }

  updateLightColor(id: string, color: string): void {
    const light = this.lights.find((l) => l.id === id)
    if (light) {
      light.color = color
    }
  }

  updateLightBrightness(id: string, brightness: number): void {
    const light = this.lights.find((l) => l.id === id)
    if (light) {
      light.brightness = brightness
    }
  }

  updateLightEffect(id: string, effectId: string): void {
    const light = this.lights.find((l) => l.id === id)
    if (light) {
      light.selectedEffect = effectId
    }
  }

  setMode(mode: LightMode): void {
    this.selectedMode.next(mode)
  }

  getMode(): Observable<LightMode> {
    return this.selectedMode.asObservable()
  }

  // Método para simular la conexión Bluetooth
  scanForDevices(): Promise<Light[]> {
    return new Promise((resolve) => {
      // Simulamos un tiempo de escaneo
      setTimeout(() => {
        resolve(this.lights)
      }, 2000)
    })
  }
}