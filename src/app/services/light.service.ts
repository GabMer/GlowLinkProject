import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"
import type { Light, Preset, TimerSettings, RGB } from "../models/light.model"

@Injectable({
  providedIn: "root",
})
export class LightService {
  // Estado inicial de las luces
  private initialLights: Light[] = [
    {
      id: 1,
      name: "Luz Principal",
      isOn: false,
      color: "#ff5500",
      brightness: 100,
      rgb: { r: 255, g: 85, b: 0 },
      selected: false,
    },
    {
      id: 2,
      name: "Luz Secundaria",
      isOn: false,
      color: "#00aaff",
      brightness: 90,
      rgb: { r: 0, g: 170, b: 255 },
      selected: false,
    },
    {
      id: 3,
      name: "Luz de Ambiente",
      isOn: false,
      color: "#ff00ff",
      brightness: 80,
      rgb: { r: 255, g: 0, b: 255 },
      selected: false,
    },
  ]

  // Estado inicial de presets
  private initialPresets: Preset[] = [
    { id: 1, name: "Fiesta", colors: ["#ff0000", "#00ff00", "#0000ff"] },
    { id: 2, name: "Relajación", colors: ["#4a00ff", "#00ffff", "#ff00ff"] },
    { id: 3, name: "Energía", colors: ["#ffff00", "#ff8800", "#ff0088"] },
  ]

  // BehaviorSubjects para manejar el estado
  public lightsSubject = new BehaviorSubject<Light[]>([...this.initialLights])
  private presetsSubject = new BehaviorSubject<Preset[]>([...this.initialPresets])
  private timerSettingsSubject = new BehaviorSubject<TimerSettings>({
    active: false,
    interval: 5,
    selectedPresetId: 1,
  })

  // Observables públicos
  public lights$: Observable<Light[]> = this.lightsSubject.asObservable()
  public presets$: Observable<Preset[]> = this.presetsSubject.asObservable()
  public timerSettings$: Observable<TimerSettings> = this.timerSettingsSubject.asObservable()

  // Temporizador
  private timerInterval: any

  constructor() {}

  /**
   * Obtiene el valor actual de las luces
   */
  public getLights(): Light[] {
    return this.lightsSubject.getValue()
  }

  /**
   * Obtiene el valor actual de los presets
   */
  public getPresets(): Preset[] {
    return this.presetsSubject.getValue()
  }

  /**
   * Obtiene la configuración actual del temporizador
   */
  public getTimerSettings(): TimerSettings {
    return this.timerSettingsSubject.getValue()
  }

  /**
   * Cambia el estado de encendido/apagado de una luz
   * @param id ID de la luz a modificar
   */
  public toggleLight(id: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => (light.id === id ? { ...light, isOn: !light.isOn } : light))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Cambia el estado de selección de una luz
   * @param id ID de la luz a modificar
   */
  public toggleLightSelection(id: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => (light.id === id ? { ...light, selected: !light.selected } : light))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Obtiene las luces seleccionadas
   */
  public getSelectedLights(): Light[] {
    return this.getLights().filter((light) => light.selected)
  }

  /**
   * Cambia el color de una luz por valor hexadecimal
   * @param id ID de la luz a modificar
   * @param color Valor hexadecimal del color
   */
  public changeColor(id: number, color: string): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => {
      if (light.id === id && light.isOn) {
        const rgb = this.hexToRgb(color)
        return { ...light, color, rgb }
      }
      return light
    })
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Cambia el color de una luz por valores RGB
   * @param id ID de la luz a modificar
   * @param channel Canal RGB a modificar ('r', 'g', o 'b')
   * @param value Nuevo valor para el canal (0-255)
   */
  public changeRgbColor(id: number, channel: "r" | "g" | "b", value: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => {
      if (light.id === id && light.isOn) {
        const newRgb = { ...light.rgb, [channel]: value }
        const newHex = this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
        return { ...light, rgb: newRgb, color: newHex }
      }
      return light
    })
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Cambia el brillo de una luz
   * @param id ID de la luz a modificar
   * @param brightness Nuevo valor de brillo (0-100)
   */
  public changeBrightness(id: number, brightness: number): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => (light.id === id ? { ...light, brightness } : light))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Enciende todas las luces
   */
  public turnAllLightsOn(): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => ({ ...light, isOn: true }))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Apaga todas las luces
   */
  public turnAllLightsOff(): void {
    const lights = this.getLights()
    const updatedLights = lights.map((light) => ({ ...light, isOn: false }))
    this.lightsSubject.next(updatedLights)
  }

  /**
   * Guarda un nuevo preset
   * @param name Nombre del nuevo preset
   * @returns ID del nuevo preset o null si no se pudo crear
   */
  public saveNewPreset(name: string): number | null {
    if (name.trim() === "") {
      return null
    }

    const lights = this.getLights()
    const newColors = lights.filter((light) => light.isOn).map((light) => light.color)

    if (newColors.length === 0) {
      return null
    }

    const presets = this.getPresets()
    const newId = Math.max(...presets.map((p) => p.id), 0) + 1
    const newPreset: Preset = {
      id: newId,
      name: name.trim(),
      colors: newColors,
    }

    this.presetsSubject.next([...presets, newPreset])
    return newId
  }

  /**
   * Aplica un preset a las luces encendidas
   * @param presetId ID del preset a aplicar
   * @returns true si se aplicó correctamente, false en caso contrario
   */
  public applyPreset(presetId: number): boolean {
    const presets = this.getPresets()
    const preset = presets.find((p) => p.id === presetId)

    if (!preset || preset.colors.length === 0) {
      return false
    }

    const lights = this.getLights()
    let colorIndex = 0
    const updatedLights = lights.map((light) => {
      if (light.isOn) {
        const newColor = preset.colors[colorIndex % preset.colors.length]
        colorIndex++
        const rgb = this.hexToRgb(newColor)
        return { ...light, color: newColor, rgb }
      }
      return light
    })

    this.lightsSubject.next(updatedLights)
    return true
  }

  /**
   * Actualiza la configuración del temporizador
   * @param settings Nueva configuración
   */
  public updateTimerSettings(settings: TimerSettings): void {
    this.timerSettingsSubject.next(settings)

    // Si el temporizador está activo, reiniciarlo con la nueva configuración
    if (settings.active) {
      this.startTimer()
    } else {
      this.clearTimer()
    }
  }

  /**
   * Inicia el temporizador para cambio automático de colores
   */
  public startTimer(): void {
    this.clearTimer() // Limpiar temporizador existente

    const timerSettings = this.getTimerSettings()
    const presets = this.getPresets()
    const selectedPreset = presets.find((p) => p.id === timerSettings.selectedPresetId)

    if (selectedPreset && timerSettings.active) {
      let colorIndex = 0

      this.timerInterval = setInterval(() => {
        const lights = this.getLights()
        const updatedLights = lights.map((light) => {
          if (light.isOn) {
            const newColor = selectedPreset.colors[colorIndex]
            const rgb = this.hexToRgb(newColor)
            return { ...light, color: newColor, rgb }
          }
          return light
        })

        this.lightsSubject.next(updatedLights)

        // Avanzar al siguiente color en el preset
        colorIndex = (colorIndex + 1) % selectedPreset.colors.length
      }, timerSettings.interval * 1000)
    }
  }

  /**
   * Detiene el temporizador
   */
  public clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  /**
   * Convierte un color hexadecimal a RGB
   * @param hex Color en formato hexadecimal
   * @returns Objeto con valores RGB
   */
  private hexToRgb(hex: string): RGB {
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
   * Convierte valores RGB a formato hexadecimal
   * @param r Valor del canal rojo (0-255)
   * @param g Valor del canal verde (0-255)
   * @param b Valor del canal azul (0-255)
   * @returns Color en formato hexadecimal
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  /**
   * Establece el modo de funcionamiento de las luces
   * @param mode Modo de funcionamiento
   */
  public setMode(mode: string): void {
    console.log(`Modo de luces establecido a: ${mode}`)
    // Aquí puedes implementar la lógica específica para cada modo
    // Por ahora solo registramos el cambio en la consola
  }
}
