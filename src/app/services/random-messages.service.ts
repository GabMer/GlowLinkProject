import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { RandomMessage } from "../models/light.model";

@Injectable({
  providedIn: "root",
})
export class RandomMessagesService {
  private messagesSubject = new BehaviorSubject<RandomMessage[]>([]);
  private isActiveSubject = new BehaviorSubject<boolean>(false);
  
  public messages$ = this.messagesSubject.asObservable();
  public isActive$ = this.isActiveSubject.asObservable();

  private messageInterval: any = null;
  private messageCounter = 0;

  private randomTexts = [
    "🎉 ¡Que comience el espectáculo!",
    "✨ Luces sincronizadas perfectamente",
    "🌈 ¡Increíble combinación de colores!",
    "🎵 El ritmo se siente en el ambiente",
    "🎆 ¡Espectáculo de luces épico!",
    "💫 Colores vibrantes iluminando la noche",
    "🎶 ¡La música y las luces en perfecta armonía!",
    "🚀 ¡Prepárate para lo mejor!",
    "💃 Luces que bailan al compás",
    "✨ ¡Momento mágico!",
    "🎨 ¡Explosión de colores!",
    "🎪 ¡El show continúa!",
    "⚡ Sincronización perfecta",
    "🌟 ¡Luces que hipnotizan!",
    "🎭 ¡Ambiente espectacular!",
    "🔥 ¡Energía al máximo!",
    "🌙 Luces nocturnas increíbles",
    "🎊 ¡Fiesta de colores!",
    "💎 Brillos deslumbrantes",
    "🎯 ¡En el punto perfecto!",
    "🌺 Colores que florecen",
    "⭐ ¡Estrella del espectáculo!",
    "🎈 ¡Diversión garantizada!",
    "🔮 Magia visual pura",
    "🎀 ¡Elegancia luminosa!"
  ];

  private messageColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
    "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3",
    "#FF9F43", "#10AC84", "#EE5A24", "#0984E3"
  ];

  constructor() {}

  startRandomMessages(): void {
    if (this.messageInterval) return;
    
    this.isActiveSubject.next(true);
    
    this.showRandomMessage();
    
    this.messageInterval = setInterval(() => {
      this.showRandomMessage();
    }, this.getRandomInterval());
  }

  stopRandomMessages(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
    
    this.isActiveSubject.next(false);
    this.messagesSubject.next([]);
  }

  private showRandomMessage(): void {
    const text = this.randomTexts[Math.floor(Math.random() * this.randomTexts.length)];
    const color = this.messageColors[Math.floor(Math.random() * this.messageColors.length)];
    
    const message: RandomMessage = {
      id: `msg_${this.messageCounter++}`,
      text,
      color,
      duration: 3500,
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, message]);

    setTimeout(() => {
      this.removeMessage(message.id);
    }, message.duration);
  }

  private removeMessage(messageId: string): void {
    const currentMessages = this.messagesSubject.getValue();
    const filteredMessages = currentMessages.filter(msg => msg.id !== messageId);
    this.messagesSubject.next(filteredMessages);
  }

  private getRandomInterval(): number {
    return Math.floor(Math.random() * 4000) + 2000;
  }

  addCustomMessage(text: string, color?: string): void {
    const message: RandomMessage = {
      id: `custom_${this.messageCounter++}`,
      text: `🎯 ${text}`,
      color: color || this.messageColors[Math.floor(Math.random() * this.messageColors.length)],
      duration: 4000,
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, message]);

    setTimeout(() => {
      this.removeMessage(message.id);
    }, message.duration);
  }
}