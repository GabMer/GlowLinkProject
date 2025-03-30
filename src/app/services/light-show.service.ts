import { Injectable } from '@angular/core';

export interface LightShow {
  id: number;
  name: string;
  description: string;
  duration: number;
  colors: string[];
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class LightShowService {
  private lightShows: LightShow[] = [
    {
      id: 1,
      name: 'Cascada Rojo-Negro',
      description: 'Efecto cascada con colores de alto contraste',
      duration: 120,
      colors: ['#000000', '#FF0000'],
      icon: 'water-outline'
    },
    {
      id: 2,
      name: 'Pulso Rítmico',
      description: 'Luces que pulsan al ritmo de la música',
      duration: 180,
      colors: ['#000000', '#FF0000'],
      icon: 'pulse-outline'
    },
    {
      id: 3,
      name: 'Aurora',
      description: 'Simulación de aurora roja',
      duration: 240,
      colors: ['#000000', '#FF0000', '#AA0000'],
      icon: 'color-wand-outline'
    }
  ];

  constructor() { }

  getAllShows(): LightShow[] {
    return this.lightShows;
  }

  getShowById(id: number): LightShow | undefined {
    return this.lightShows.find(show => show.id === id);
  }
}