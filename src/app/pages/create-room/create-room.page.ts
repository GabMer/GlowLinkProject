import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from 'src/app/services/room.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './create-room.page.html',
  styleUrls: ['./create-room.page.scss']
})
export class CreateRoomPage {
  shows = [
    {
      id: 'default',
      name: 'Predeterminado',
      description: 'Colores y efectos definidos previamente',
      icon: 'color-palette'
    },
    {
      id: 'custom',
      name: 'Personalizado',
      description: 'El usuario elige color y brillo',
      icon: 'options'
    },
    {
      id: 'music',
      name: 'Sincronizado con música',
      description: 'Los efectos se adaptan al ritmo',
      icon: 'musical-notes'
    }
  ];

  constructor(private roomService: RoomService, private router: Router) {}

  createRoom(type: 'default' | 'custom' | 'music') {
    const room = this.roomService.createRoom(type, 'user123');
    this.router.navigateByUrl(`/room/${room.id}`);
  }
}
