import { Component, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: "app-welcome",
  templateUrl: "./logo.page.html",
  styleUrls: ["./logo.page.scss"],
  imports: [IonicModule]
})
export class WelcomePage implements OnInit {
  loadingProgress = 0

  constructor(private router: Router) {}

  ngOnInit() {
    // Simular progreso de carga
    const interval = setInterval(() => {
      this.loadingProgress += 0.2
      if (this.loadingProgress >= 1) {
        clearInterval(interval)
      }
    }, 1000)

    // Redireccionar después de 5 segundos
    setTimeout(() => {
      this.router.navigateByUrl("/welcome")
    }, 5000)
  }
}

export default WelcomePage
