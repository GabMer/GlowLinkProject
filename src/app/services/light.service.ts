import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"
import type { Light } from "../models/light.model"

@Injectable({
  providedIn: "root",
})
export class LightService {
  // Sujeto observable para las luces
  public lightsSubject = new BehaviorSubject<Light[]>([
    { id: 1, name: "Luz 1", isOn: false, color: "#ffffff", brightness: 100, rgb: { r: 255, g: 255, b: 255 } },
    { id: 2, name: "Luz 2", isOn: false, color: "#ffffff", brightness: 100, rgb: { r: 255, g: 255, b: 255 } },
    { id: 3, name: "Luz 3", isOn: false, color: "#ffffff", brightness: 100, rgb: { r: 255, g: 255, b: 255 } },
    { id: 4, name: "Luz 4", isOn: false, color: "#ffffff", brightness: 100, rgb: { r: 255, g: 255, b: 255 } },
  ])

  // Observable público para las luces
  public lights$: Observable<Light[]> = this.lightsSubject.asObservable()

  // Modo actual de las luces (normal, preset, etc.)
  private currentMode = "normal"

  constructor() {}

  /**
   * Obtiene todas las luces
   */
  getLights(): Light[] {
    return this.lightsSubject.getValue()
  }

  /**
   * Enciende o apaga una luz específica
   * @param id ID de la luz
   */
  toggleLight(id: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => {
      if (light.id === id) {
        return { ...light, isOn: !light.isOn }
      }
      return light
    })
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Cambia el color de una luz específica
   * @param id ID de la luz
   * @param color Color en formato hexadecimal
   */
  changeColor(id: number, color: string): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => {
      if (light.id === id) {
        const rgb = this.hexToRgb(color)
        return { ...light, color, rgb }
      }
      return light
    })
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Cambia el brillo de una luz específica
   * @param id ID de la luz
   * @param brightness Nivel de brillo (0-100)
   */
  changeBrightness(id: number, brightness: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => {
      if (light.id === id) {
        return { ...light, brightness }
      }
      return light
    })
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Enciende todas las luces
   */
  turnAllLightsOn(): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => ({ ...light, isOn: true }))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Apaga todas las luces
   */
  turnAllLightsOff(): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => ({ ...light, isOn: false }))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Establece el modo de las luces
   * @param mode Modo de las luces (normal, preset:fiesta, etc.)
   */
  setMode(mode: string): void {
    this.currentMode = mode
  }

  /**
   * Obtiene el modo actual de las luces
   */
  getMode(): string {
    return this.currentMode
  }

  /**
   * Convierte un color hexadecimal a RGB
   * @param hex Color en formato hexadecimal
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }
}
