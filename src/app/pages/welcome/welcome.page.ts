import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-welcome",
  templateUrl: "./welcome.page.html",
  styleUrls: ["./welcome.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WelcomePage implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Verificar si el usuario ya está autenticado
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        // Si ya está autenticado, redirigir a home
        this.router.navigate(["/home"])
      }
    })
  }

  handleLogin() {
    this.router.navigate(["/auth/login"])
  }

  handleRegister() {
    this.router.navigate(["/auth/register"])
  }
}

export default WelcomePage
