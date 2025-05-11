import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage {
  // Esta página es un placeholder para la autenticación
  // Por simplicidad, asumimos que el usuario está autenticado
  
  constructor(private router: Router) {}

  login() {
    // Simulamos un login exitoso
    setTimeout(() => {
      this.router.navigateByUrl("/shows")
    }, 1000)
  }
}

export default AuthPage