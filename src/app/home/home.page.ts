import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  loadingProgress = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simular progreso de carga
    const interval = setInterval(() => {
      this.loadingProgress += 0.2;
      if (this.loadingProgress >= 1) {
        clearInterval(interval);
      }
    }, 1000);

    // Redireccionar después de 5 segundos
    setTimeout(() => {
      this.router.navigateByUrl('/shows');
    }, 5000);
  }
}