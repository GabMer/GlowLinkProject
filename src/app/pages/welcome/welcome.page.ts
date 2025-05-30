import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { IonicModule, ModalController } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"
import { RouterModule } from "@angular/router"
import { ColorblindModalComponent } from "../../components/colorblind-modal.component"

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
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Verificar si el usuario ya está autenticado
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        // Si ya está autenticado, redirigir a home
        this.router.navigate(["/home"])
      }
    })

    // Mostrar modal de daltonismo si es la primera vez
    this.checkFirstTime()
  }

  private async checkFirstTime() {
    const hasSeenColorblindModal = localStorage.getItem('hasSeenColorblindModal')
    if (!hasSeenColorblindModal) {
      setTimeout(async () => {
        await this.showColorblindModal()
      }, 1000) // Mostrar después de 1 segundo
    }
  }

  private async showColorblindModal() {
    const modal = await this.modalController.create({
      component: ColorblindModalComponent,
      backdropDismiss: false
    })

    await modal.present()

    const { data } = await modal.onDidDismiss()
    localStorage.setItem('hasSeenColorblindModal', 'true')
  }

  handleLogin() {
    this.router.navigate(["/auth/login"])
  }

  handleRegister() {
    this.router.navigate(["/auth/register"])
  }
}

export default WelcomePage