export interface Light {
  id: string
  name: string
  connected: boolean
  brightness: number
  color: string
  effects: string[]
  selectedEffect?: string
}

export interface LightEffect {
  id: string
  name: string
  description: string
  colors: string[]
  speed: number
  intensity: number
}

export enum LightMode {
  DEFAULT = "default",
  CUSTOM = "custom",
  MUSIC = "music",
}