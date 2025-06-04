export interface Room {
  id: string;
  creatorUid: string;
  showType: "default" | "custom" | "music";
  status: "waiting" | "active" | "finished";
  text: string;
  textMode: "static" | "scroll" | "continuous";
  connectedUsers: string[];
  animationActive: boolean;
  createdAt: number;
  /** Si showType === 'default', guardamos qué preset (ej: 'fiesta') */
  presetId?: string;
}
