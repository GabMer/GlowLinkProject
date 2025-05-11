import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-welcome",
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: "./welcome.page.html",
  styleUrls: ["./welcome.page.scss"],
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
      this.router.navigateByUrl("/shows")
    }, 5000)
  }
}

export default WelcomePage