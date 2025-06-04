import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-join-room-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Unirse a sala existente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">X</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">Ingrese código o link de sala</ion-label>
        <ion-input [(ngModel)]="inputCode" type="text"></ion-input>
      </ion-item>
      <ion-button expand="block" (click)="enterRoom()" [disabled]="!inputCode">Entrar</ion-button>
    </ion-content>
  `,
})

export class JoinRoomModalComponent {
  inputCode: string = '';

  constructor(
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  close() {
    this.modalCtrl.dismiss();
  }

  enterRoom() {
    const code = this.extractRoomCode(this.inputCode);

    // Redirigir al componente de sala con el código
    this.modalCtrl.dismiss();
    this.router.navigate(['/waiting-room'], { queryParams: { code } });
  }

  extractRoomCode(input: string): string {
    // Soporta pegar link o solo el código
    const match = input.match(/code=([A-Za-z0-9]+)/) || input.match(/\/room\/([A-Za-z0-9]+)/);
    return match ? match[1] : input;
  }
}
