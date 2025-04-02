import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shows',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './shows.page.html',
  styleUrls: ['./shows.page.scss'],
})
export class ShowsPage {
  shows = [
    {
      id: 'celebration',
      name: 'Celebración',
      icon: 'star',
      color: '#1a4d88', // Azul oscuro con bordes
      iconColor: '#ffdd00', // Amarillo para la estrella
      textColor: '#ffdd00' // Texto amarillo
    },
    {
      id: 'romantic',
      name: 'Romántico',
      icon: 'heart',
      color: '#4a1a5a', // Morado oscuro con bordes
      iconColor: '#ff3333', // Rojo para el corazón
      textColor: '#ffdd00' // Texto amarillo
    },
    {
      id: 'party',
      name: 'Fiesta',
      icon: 'musical-notes',
      color: '#1a4d88', // Azul oscuro con bordes
      iconColor: '#ffffff', // Blanco para las notas musicales
      textColor: '#ffffff' // Texto blanco
    },
    {
      id: 'nature',
      name: 'Naturaleza',
      icon: 'leaf',
      color: '#0a4a1a', // Verde oscuro con bordes
      iconColor: '#66ff66', // Verde claro para la hoja
      textColor: '#ffffff' // Texto blanco
    }
  ];

  constructor(private router: Router) {}

  connectDevices() {
    this.router.navigateByUrl('/connection');
  }

  selectShow(showId: string) {
    console.log('Seleccionado:', showId);
    // Aquí puedes añadir lógica para manejar la selección
  }
}