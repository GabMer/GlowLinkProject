import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { addIcons } from "ionicons"
import {
  arrowForward,
  settingsOutline,
  accessibilityOutline,
  sparklesOutline,
  logoFirebase,
  checkmarkCircleOutline,
} from "ionicons/icons"

@Component({
  selector: "app-tutorial",
  templateUrl: "./tutorial.page.html",
  styleUrls: ["./tutorial.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TutorialPage implements OnInit {
  currentSlide = 0
  sensitivityModeEnabled = false
  colorPreviewHue = 0
  colorInterval: any

  constructor(private router: Router) {
    // Registrar los iconos
    addIcons({
      "arrow-forward": arrowForward,
      "settings-outline": settingsOutline,
      "accessibility-outline": accessibilityOutline,
      "sparkles-outline": sparklesOutline,
      "logo-firebase": logoFirebase,
      "checkmark-circle-outline": checkmarkCircleOutline,
    })
  }

  ngOnInit() {
    // Comprobar si el usuario ya ha visto el tutorial
    const tutorialSeen = localStorage.getItem("tutorialSeen")
    if (tutorialSeen === "true") {
      this.skipToWelcome()
      return
    }

    // Comprobar si el modo de sensibilidad ya está configurado
    const sensitivityMode = localStorage.getItem("sensitivityMode")
    if (sensitivityMode === "true") {
      this.sensitivityModeEnabled = true
    }

    // Iniciar la animación de cambio de color
    this.startColorAnimation()
  }

  ngOnDestroy() {
    // Limpiar el intervalo al salir
    if (this.colorInterval) {
      clearInterval(this.colorInterval)
    }
  }

  /**
   * Inicia la animación de cambio de color para el preview
   */
  startColorAnimation() {
    // Limpiar intervalo existente si lo hay
    if (this.colorInterval) {
      clearInterval(this.colorInterval)
    }

    // Crear un nuevo intervalo para cambiar el color
    this.colorInterval = setInterval(
      () => {
        // Incrementar el tono (hue) para cambiar el color
        this.colorPreviewHue = (this.colorPreviewHue + 1) % 360

        // Si el modo de sensibilidad está activado, hacer cambios más suaves
        if (this.sensitivityModeEnabled) {
          // Cambiar el color más lentamente (cada 2 iteraciones)
          if (this.colorPreviewHue % 2 === 0) {
            this.colorPreviewHue = (this.colorPreviewHue + 1) % 360
          }
        }
      },
      this.sensitivityModeEnabled ? 100 : 50,
    ) // Velocidad más lenta en modo sensibilidad
  }

  /**
   * Avanza a la siguiente diapositiva
   */
  nextSlide() {
    if (this.currentSlide < 2) {
      this.currentSlide++
    } else {
      this.finishTutorial()
    }
  }

  /**
   * Retrocede a la diapositiva anterior
   */
  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--
    }
  }

  /**
   * Activa o desactiva el modo de sensibilidad
   */
  toggleSensitivityMode() {
    this.sensitivityModeEnabled = !this.sensitivityModeEnabled
    localStorage.setItem("sensitivityMode", this.sensitivityModeEnabled.toString())

    // Actualizar la animación de color según el modo
    this.startColorAnimation()
  }

  /**
   * Finaliza el tutorial y navega a la pantalla de bienvenida
   */
  finishTutorial() {
    // Guardar que el usuario ha visto el tutorial
    localStorage.setItem("tutorialSeen", "true")

    // Guardar la configuración del modo de sensibilidad
    localStorage.setItem("sensitivityMode", this.sensitivityModeEnabled.toString())

    // Navegar a la pantalla de bienvenida
    this.skipToWelcome()
  }

  /**
   * Salta directamente a la pantalla de bienvenida
   */
  skipToWelcome() {
    this.router.navigate(["/welcome"])
  }
}
