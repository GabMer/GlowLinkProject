import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class BluetoothService {
  private connectionStatusSubject = new BehaviorSubject<boolean>(false)
  private searchingStatusSubject = new BehaviorSubject<boolean>(false)

  public connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable()
  public searchingStatus$: Observable<boolean> = this.searchingStatusSubject.asObservable()

  constructor() {}

  /**
   * Obtiene el estado actual de la conexión Bluetooth
   */
  public isConnected(): boolean {
    return this.connectionStatusSubject.getValue()
  }

  /**
   * Obtiene el estado actual de búsqueda Bluetooth
   */
  public isSearching(): boolean {
    return this.searchingStatusSubject.getValue()
  }

  /**
   * Conecta o desconecta el dispositivo Bluetooth
   * @returns Promise que se resuelve cuando la operación se completa
   */
  public toggleConnection(): Promise<boolean> {
    const isCurrentlyConnected = this.isConnected()

    if (isCurrentlyConnected) {
      // Desconectar
      this.connectionStatusSubject.next(false)
      return Promise.resolve(false)
    } else {
      // Conectar (simulación)
      this.searchingStatusSubject.next(true)

      return new Promise((resolve) => {
        setTimeout(() => {
          this.searchingStatusSubject.next(false)
          this.connectionStatusSubject.next(true)
          resolve(true)
        }, 2000)
      })
    }
  }

  /**
   * Envía datos al dispositivo Bluetooth conectado
   * En una implementación real, esto enviaría los datos al dispositivo
   * @param data Datos a enviar
   * @returns Promise que se resuelve cuando los datos se envían correctamente
   */
  public sendData(data: any): Promise<boolean> {
    if (!this.isConnected()) {
      return Promise.reject(new Error("No hay dispositivo Bluetooth conectado"))
    }

    // Simulación de envío de datos
    console.log("Enviando datos al dispositivo Bluetooth:", data)
    return Promise.resolve(true)
  }
}
