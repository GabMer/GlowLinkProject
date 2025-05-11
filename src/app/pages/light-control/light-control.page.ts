import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { LightService } from "../../services/light.service"
import { type Light, type LightEffect, LightMode } from "../../models/light.model"
import { FilterByPipe } from "../../pipes/filter-by.pipe"

@Component({
  selector: "app-light-control",
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, FilterByPipe],
  templateUrl: "./light-control.page.html",
  styleUrls: ["./light-control.page.scss"],
})
export class LightControlPage implements OnInit {
  lights: Light[] = []
  effects: LightEffect[] = []
  currentMode: LightMode = LightMode.DEFAULT
  selectedColor = "#ff0000"
  selectedBrightness = 80
  isCustomMode = false
  isMusicMode = false

  // Colores predefinidos para el modo personalizado
  predefinedColors: string[] = [
    "#ff0000", // Rojo
    "#ff3300", // Naranja rojizo
    "#ff6600", // Naranja
    "#990000", // Rojo oscuro
    "#660000", // Burdeos
    "#330000", // Rojo muy oscuro
    "#ffffff", // Blanco
    "#000000", // Negro
  ]

  constructor(
    private lightService: LightService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.lights = this.lightService.getLights()
    this.effects = this.lightService.getAvailableEffects()

    this.lightService.getMode().subscribe((mode) => {
      this.currentMode = mode
      this.isCustomMode = mode === LightMode.CUSTOM
      this.isMusicMode = mode === LightMode.MUSIC
    })
  }

  goToSelectedLights() {
    this.router.navigateByUrl("/selected-lights")
  }

  goBack() {
    this.router.navigateByUrl("/shows")
  }

  toggleLightConnection(light: Light) {
    if (light.connected) {
      this.lightService.disconnectLight(light.id)
    } else {
      this.lightService.connectLight(light.id)
    }
    // Actualizar la lista de luces
    this.lights = this.lightService.getLights()
  }

  updateLightColor(lightId: string, color: string) {
    this.lightService.updateLightColor(lightId, color)
    // Actualizar la lista de luces
    this.lights = this.lightService.getLights()
  }

  updateLightBrightness(lightId: string, event: any) {
    const brightness = event.detail.value
    this.lightService.updateLightBrightness(lightId, brightness)
  }

  updateLightEffect(lightId: string, effectId: string) {
    this.lightService.updateLightEffect(lightId, effectId)
    // Actualizar la lista de luces
    this.lights = this.lightService.getLights()
  }

  applyToAllLights() {
    this.lights.forEach((light) => {
      if (light.connected) {
        this.lightService.updateLightColor(light.id, this.selectedColor)
        this.lightService.updateLightBrightness(light.id, this.selectedBrightness)
      }
    })
    // Actualizar la lista de luces
    this.lights = this.lightService.getLights()
  }

  getEffectName(effectId: string | undefined): string {
    if (!effectId) return "Ninguno"
    const effect = this.effects.find((e) => e.id === effectId)
    return effect ? effect.name : "Desconocido"
  }
}

export default LightControlPage