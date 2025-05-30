import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private currentMessageSubject = new BehaviorSubject<string>('');
  public currentMessage$ = this.currentMessageSubject.asObservable();

  private autoMessageInterval: any = null;
  private isAutoMode = false;

  private partyMessages = [
    "¡La fiesta está encendida! 🔥",
    "¡Que siga la música! 🎵",
    "¡Todos a bailar! 💃🕺",
    "¡Esta noche es nuestra! ✨",
    "¡Luces, cámara, acción! 🎬",
    "¡El ritmo nos une! 🎶",
    "¡Brillemos juntos! 💫",
    "¡La energía está al máximo! ⚡",
    "¡Momento épico! 🚀",
    "¡Vamos con todo! 💪",
    "¡La pista es nuestra! 🕺💃",
    "¡Que no pare la música! 🎵",
    "¡Luces sincronizadas! 🌈",
    "¡Fiesta sin límites! 🎉",
    "¡El show debe continuar! 🎭",
    "¡Energía positiva! ☀️",
    "¡Todos conectados! 🔗",
    "¡Momento mágico! ✨",
    "¡La noche es joven! 🌙",
    "¡Vamos por más! 🔥"
  ];

  private motivationalMessages = [
    "¡Eres increíble! 🌟",
    "¡Sigue brillando! ✨",
    "¡Tu energía es contagiosa! ⚡",
    "¡Eres la luz de la fiesta! 💡",
    "¡Tu sonrisa ilumina todo! 😊",
    "¡Eres único y especial! 🦄",
    "¡Tu presencia hace la diferencia! 👑",
    "¡Eres pura magia! 🎩✨",
    "¡Tu vibe es perfecto! 🌈",
    "¡Eres una estrella! ⭐"
  ];

  private danceMessages = [
    "¡Mueve ese cuerpo! 💃",
    "¡Deja que el ritmo te lleve! 🎵",
    "¡Baila como si nadie te viera! 🕺",
    "¡Siente la música! 🎶",
    "¡Libera tu alma! 🦋",
    "¡El baile es libertad! 🕊️",
    "¡Expresa tu alegría! 😄",
    "¡Cada paso cuenta! 👣",
    "¡Baila con el corazón! ❤️",
    "¡Eres puro ritmo! 🥁"
  ];

  constructor() {}

  generateRandomMessage(): void {
    const allMessages = [
      ...this.partyMessages,
      ...this.motivationalMessages,
      ...this.danceMessages
    ];
    
    const randomIndex = Math.floor(Math.random() * allMessages.length);
    const message = allMessages[randomIndex];
    
    this.currentMessageSubject.next(message);
  }

  generateCategoryMessage(category: 'party' | 'motivational' | 'dance'): void {
    let messages: string[] = [];
    
    switch (category) {
      case 'party':
        messages = this.partyMessages;
        break;
      case 'motivational':
        messages = this.motivationalMessages;
        break;
      case 'dance':
        messages = this.danceMessages;
        break;
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];
    
    this.currentMessageSubject.next(message);
  }

  startAutoMessages(intervalSeconds: number = 30): void {
    this.stopAutoMessages(); // Detener cualquier intervalo existente
    
    this.isAutoMode = true;
    this.autoMessageInterval = setInterval(() => {
      this.generateRandomMessage();
    }, intervalSeconds * 1000);
  }

  stopAutoMessages(): void {
    this.isAutoMode = false;
    if (this.autoMessageInterval) {
      clearInterval(this.autoMessageInterval);
      this.autoMessageInterval = null;
    }
  }

  isAutoModeActive(): boolean {
    return this.isAutoMode;
  }

  getCurrentMessage(): string {
    return this.currentMessageSubject.value;
  }

  // Método para generar mensaje basado en datos de audio
  generateAudioBasedMessage(audioData: any): void {
    let message = '';
    
    if (audioData.bpm > 140) {
      // Música rápida - mensajes de energía
      const highEnergyMessages = [
        "¡La energía está por las nubes! 🚀",
        "¡Esto está que arde! 🔥",
        "¡Velocidad máxima! ⚡",
        "¡Adrenalina pura! 💥"
      ];
      message = highEnergyMessages[Math.floor(Math.random() * highEnergyMessages.length)];
    } else if (audioData.bpm < 80) {
      // Música lenta - mensajes relajados
      const chillMessages = [
        "¡Momento de relajación! 😌",
        "¡Vibe tranquilo! 🌊",
        "¡Disfruta el momento! ✨",
        "¡Paz y armonía! 🕊️"
      ];
      message = chillMessages[Math.floor(Math.random() * chillMessages.length)];
    } else {
      // Música normal - mensajes generales
      this.generateRandomMessage();
      return;
    }
    
    this.currentMessageSubject.next(message);
  }

  // Método para agregar mensajes personalizados
  addCustomMessage(message: string): void {
    this.partyMessages.push(message);
  }

  // Método para obtener estadísticas de mensajes
  getMessageStats(): any {
    return {
      totalMessages: this.partyMessages.length + this.motivationalMessages.length + this.danceMessages.length,
      partyMessages: this.partyMessages.length,
      motivationalMessages: this.motivationalMessages.length,
      danceMessages: this.danceMessages.length,
      isAutoMode: this.isAutoMode
    };
  }
}