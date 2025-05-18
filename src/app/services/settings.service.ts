import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private sensitivityModeSubject = new BehaviorSubject<boolean>(false)
  public sensitivityMode$: Observable<boolean> = this.sensitivityModeSubject.asObservable()

  constructor() {
    // Cargar la configuración del modo de sensibilidad desde localStorage
    this.loadSensitivityMode()
  }

  /**
   * Carga la configuración del modo de sensibilidad desde localStorage
   */
  private loadSensitivityMode(): void {
    const sensitivityMode = localStorage.getItem("sensitivityMode")
    if (sensitivityMode === "true") {
      this.sensitivityModeSubject.next(true)
    }
  }

  /**
   * Obtiene el estado actual del modo de sensibilidad
   */
  public isSensitivityModeEnabled(): boolean {
    return this.sensitivityModeSubject.getValue()
  }

  /**
   * Activa o desactiva el modo de sensibilidad
   * @param enabled Estado del modo de sensibilidad
   */
  public setSensitivityMode(enabled: boolean): void {
    this.sensitivityModeSubject.next(enabled)
    localStorage.setItem("sensitivityMode", enabled.toString())
  }

  /**
   * Alterna el estado del modo de sensibilidad
   */
  public toggleSensitivityMode(): boolean {
    const newState = !this.isSensitivityModeEnabled()
    this.setSensitivityMode(newState)
    return newState
  }
}
