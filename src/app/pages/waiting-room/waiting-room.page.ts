import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonModal, IonLabel } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonInput, IonModal, IonLabel],
  templateUrl: './waiting-room.page.html',
  styleUrls: ['./waiting-room.page.scss']
})
export class WaitingRoomPage implements OnInit {
  roomCode = '';
  inputCode = '';
  showModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    // Si la ruta trae código, usarlo y validar
    const codeFromRoute = this.route.snapshot.paramMap.get('code');
    if (codeFromRoute) {
      this.checkRoomAndNavigate(codeFromRoute);
    } else {
      this.openModal();
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Validar sala y redirigir
  checkRoomAndNavigate(code: string) {
    const room = this.roomService.getRoom(code);
    if (!room) {
      alert('Sala no encontrada. Verifica el código.');
      this.openModal();
      return;
    }

    this.roomCode = code;

    if (this.roomService.isRoomStarted(code)) {
      // Sala iniciada, navegar a show
      this.router.navigate(['/room-player', code]);
    } else {
      // Sala en espera, mostrar waiting room
      this.router.navigate(['/waiting-room', code]);
      this.closeModal();
    }
  }

  onJoinClicked() {
    if (this.inputCode.trim() === '') {
      alert('Por favor ingresa un código de sala.');
      return;
    }
    this.checkRoomAndNavigate(this.inputCode.trim());
  }

  startShow() {
    if (!this.roomCode) return;
    const started = this.roomService.startRoom(this.roomCode);
    if (started) {
      this.router.navigate(['/room-player', this.roomCode]);
    } else {
      alert('No se pudo iniciar la sala.');
    }
  }
}
