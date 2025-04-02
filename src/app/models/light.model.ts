export interface RGB {
  r: number
  g: number
  b: number
}

export interface Light {
  id: number
  name: string
  isOn: boolean
  color: string
  brightness: number
  rgb: RGB
  selected?: boolean
  isFlashing?: boolean; 
}


export interface Preset {
  id: number
  name: string
  colors: string[]
}

export interface TimerSettings {
  active: boolean
  interval: number // segundos
  selectedPresetId: number
}

