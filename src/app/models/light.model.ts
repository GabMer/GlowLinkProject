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
  isFlashing?: boolean
}

export interface Preset {
  id: number
  name: string
  colors: string[]
}

export interface TimerSettings {
  active: boolean
  interval: number
  selectedPresetId: number
}

export interface AudioData {
  volume: number
  frequency: number
  bpm: number
  dominantFrequency: number
  frequencies: number[]
  timestamp: number
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  thumbnail?: string
}

export interface Room {
  id: string
  name: string
  hostId: string
  hostName: string
  participants: string[]
  lightState: any
  messages: RoomMessage[]
  createdAt: Date
  isActive: boolean
}

export interface RoomMessage {
  id: string
  text: string
  timestamp: Date
  type: 'system' | 'user'
}

export interface RandomMessage {
  id: string
  text: string
  color: string
  duration: number
  timestamp: Date
}

export interface ColorblindSettings {
  enabled: boolean
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'normal'
  intensity: number
}