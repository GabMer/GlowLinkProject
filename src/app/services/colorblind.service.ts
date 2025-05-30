import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ColorblindSettings } from "../models/light.model";

@Injectable({
  providedIn: "root",
})
export class ColorblindService {
  private colorblindSettingsSubject = new BehaviorSubject<ColorblindSettings>({
    enabled: false,
    type: 'normal',
    intensity: 50
  });

  public colorblindSettings$: Observable<ColorblindSettings> = 
    this.colorblindSettingsSubject.asObservable();

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('colorblindSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.colorblindSettingsSubject.next(settings);
    }
  }

  public setColorblindMode(settings: ColorblindSettings): void {
    this.colorblindSettingsSubject.next(settings);
    localStorage.setItem('colorblindSettings', JSON.stringify(settings));
    this.applyColorblindFilter(settings);
  }

  public getCurrentSettings(): ColorblindSettings {
    return this.colorblindSettingsSubject.getValue();
  }

  private applyColorblindFilter(settings: ColorblindSettings): void {
    const body = document.body;
    
    if (!settings.enabled) {
      body.style.filter = '';
      return;
    }

    let filterValue = '';
    const intensity = settings.intensity / 100;

    switch (settings.type) {
      case 'protanopia':
        filterValue = `sepia(${intensity * 0.8}) saturate(${1 - intensity * 0.5}) hue-rotate(${intensity * 20}deg)`;
        break;
      case 'deuteranopia':
        filterValue = `sepia(${intensity * 0.6}) saturate(${1 - intensity * 0.3}) hue-rotate(${intensity * -10}deg)`;
        break;
      case 'tritanopia':
        filterValue = `sepia(${intensity * 0.4}) saturate(${1 - intensity * 0.4}) hue-rotate(${intensity * 30}deg)`;
        break;
    }

    body.style.filter = filterValue;
  }

  public adaptColor(color: string): string {
    const settings = this.getCurrentSettings();
    if (!settings.enabled) return color;

    const hsl = this.hexToHsl(color);
    
    switch (settings.type) {
      case 'protanopia':
        hsl.h = (hsl.h + 20) % 360;
        hsl.s = Math.max(0, hsl.s - 0.2);
        break;
      case 'deuteranopia':
        hsl.h = (hsl.h - 10) % 360;
        hsl.s = Math.max(0, hsl.s - 0.1);
        break;
      case 'tritanopia':
        hsl.h = (hsl.h + 30) % 360;
        hsl.s = Math.max(0, hsl.s - 0.15);
        break;
    }

    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  private hexToHsl(hex: string): {h: number, s: number, l: number} {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
}