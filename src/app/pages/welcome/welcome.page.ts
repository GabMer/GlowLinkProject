import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/angular/standalone"
import {
  IonButton,
  IonText,
  IonRouterLink,
  IonFooter,
} from "@ionic/angular/standalone"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-welcome",
  templateUrl: "./welcome.page.html",
  styleUrls: ["./welcome.page.scss"],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonText, IonRouterLink, IonFooter, IonToolbar],
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
        // Si ya está autenticado, redirigir al control de luces
        this.router.navigate(["/light-control"])
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

