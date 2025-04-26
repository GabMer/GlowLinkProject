import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LightDevice {
  id: string;
  name: string;
  connected: boolean;
  rssi: number;
}

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {
  // Dispositivos de prueba
  private mockDevices: LightDevice[] = [
    { id: 'A1:B2:C3:D4:E5:F6', name: 'GlowLink Light Strip', connected: false, rssi: -65 },
    { id: 'F6:E5:D4:C3:B2:A1', name: 'GlowLink Ambient', connected: false, rssi: -72 },
    { id: '12:34:56:78:9A:BC', name: 'LED Controller 01', connected: false, rssi: -80 }
  ];

  private devices = new BehaviorSubject<LightDevice[]>([]);
  public devices$ = this.devices.asObservable();

  private isScanning = new BehaviorSubject<boolean>(false);
  public isScanning$ = this.isScanning.asObservable();

  private selectedDevice = new BehaviorSubject<LightDevice | null>(null);
  public selectedDevice$ = this.selectedDevice.asObservable();

  constructor() { }

  /**
   * Inicializa el Bluetooth (simulado)
   */
  async initialize(): Promise<boolean> {
    console.log('Bluetooth inicializado (simulado)');
    return true;
  }

  /**
   * Comenzar el escaneo de dispositivos Bluetooth (simulado)
   */
  async startScan(): Promise<void> {
    console.log('Iniciando escaneo (simulado)');
    this.isScanning.next(true);

    // Simular demora de escaneo
    setTimeout(() => {
      this.devices.next([...this.mockDevices]);
      this.stopScan();
    }, 3000);
  }

  /**
   * Detener el escaneo de dispositivos (simulado)
   */
  async stopScan(): Promise<void> {
    console.log('Deteniendo escaneo (simulado)');
    this.isScanning.next(false);
  }

  /**
   * Conectar a un dispositivo específico (simulado)
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    console.log(`Conectando a dispositivo ${deviceId} (simulado)`);

    const deviceList = [...this.mockDevices];
    const deviceIndex = deviceList.findIndex(d => d.id === deviceId);

    if (deviceIndex !== -1) {
      deviceList[deviceIndex].connected = true;
      this.mockDevices = deviceList;
      this.devices.next(deviceList);
      this.selectedDevice.next(deviceList[deviceIndex]);
      return true;
    }

    return false;
  }

  /**
   * Desconectar de un dispositivo (simulado)
   */
  async disconnectFromDevice(deviceId: string): Promise<boolean> {
    console.log(`Desconectando de dispositivo ${deviceId} (simulado)`);

    const deviceList = [...this.mockDevices];
    const deviceIndex = deviceList.findIndex(d => d.id === deviceId);

    if (deviceIndex !== -1) {
      deviceList[deviceIndex].connected = false;
      this.mockDevices = deviceList;
      this.devices.next(deviceList);

      if (this.selectedDevice.value?.id === deviceId) {
        this.selectedDevice.next(null);
      }

      return true;
    }

    return false;
  }

  /**
   * Establecer el color de las luces (simulado)
   */
  async setLightColor(deviceId: string, color: string): Promise<boolean> {
    console.log(`Estableciendo color ${color} para dispositivo ${deviceId} (simulado)`);
    return true;
  }

  /**
   * Establecer el efecto de luces (simulado)
   */
  async setLightEffect(deviceId: string, effectId: number): Promise<boolean> {
    console.log(`Estableciendo efecto ${effectId} para dispositivo ${deviceId} (simulado)`);
    return true;
  }

  /**
   * Ajustar el brillo de las luces (simulado)
   */
  async setLightBrightness(deviceId: string, brightness: number): Promise<boolean> {
    console.log(`Estableciendo brillo ${brightness} para dispositivo ${deviceId} (simulado)`);
    return true;
  }
}
