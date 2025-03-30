import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './connection.page.html',
  styleUrls: ['./connection.page.scss'],
})
export class ConnectionPage {
  lightShows = [
    {
      name: 'Show 1',
      description: 'Amazing light display',
      duration: '30 mins',
      icon: 'bulb', // Agrega un icono válido de Ionicons
      colors: ['#ff0000', '#00ff00', '#0000ff'] // Agrega una lista de colores
    },
    {
      name: 'Show 2',
      description: 'Colorful LED show',
      duration: '45 mins',
      icon: 'color-filter',
      colors: ['#ffaa00', '#ff00ff', '#00aaff']
    },
    {
      name: 'Show 3',
      description: 'Spectacular laser performance',
      duration: '1 hour',
      icon: 'flash',
      colors: ['#ffffff', '#ffcc00', '#ff33cc']
    }
  ];
}
