import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule, ToastController, LoadingController } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthPage implements OnInit {
  activeTab: "login" | "register" = "login"
  isLoading = false
  
  // Login fields
  loginEmail = ""
  loginPassword = ""
  
  // Register fields
  registerEmail = ""
  registerPassword = ""
  registerName = ""
  registerConfirmPassword = ""

  // Toast properties
  showToastMessage = false
  errorMessage = ""

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const mode = this.route.snapshot.paramMap.get("mode") as "login" | "register"
    this.activeTab = mode || "login"
  }

  handleTabChange(event: any) {
    this.activeTab = event.detail.value
    this.clearFields()
  }

  async handleLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.showToast("Por favor completa todos los campos")
      return
    }

    this.isLoading = true

    try {
      await this.authService.login(this.loginEmail, this.loginPassword).toPromise()
      this.isLoading = false
      this.router.navigate(["/home"])
    } catch (error: any) {
      this.isLoading = false
      this.showToast(error.message || "Error al iniciar sesión")
    }
  }

  async handleRegister() {
    if (!this.registerEmail || !this.registerPassword || !this.registerName) {
      this.showToast("Por favor completa todos los campos")
      return
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.showToast("Las contraseñas no coinciden")
      return
    }

    if (this.registerPassword.length < 6) {
      this.showToast("La contraseña debe tener al menos 6 caracteres")
      return
    }

    this.isLoading = true

    try {
      await this.authService.register(
        this.registerEmail, 
        this.registerPassword, 
        this.registerName
      ).toPromise()
      this.isLoading = false
      this.showToast("Cuenta creada exitosamente")
      this.router.navigate(["/home"])
    } catch (error: any) {
      this.isLoading = false
      this.showToast(error.message || "Error al crear la cuenta")
    }
  }

  async handleForgotPassword() {
    if (!this.loginEmail) {
      this.showToast("Por favor ingresa tu email")
      return
    }

    this.isLoading = true

    try {
      await this.authService.resetPassword(this.loginEmail).toPromise()
      this.isLoading = false
      this.showToast("Email de recuperación enviado")
    } catch (error: any) {
      this.isLoading = false
      this.showToast(error.message || "Error al enviar email")
    }
  }

  switchMode() {
    this.activeTab = this.activeTab === "login" ? "register" : "login"
    this.clearFields()
  }

  private clearFields() {
    this.loginEmail = ""
    this.loginPassword = ""
    this.registerEmail = ""
    this.registerPassword = ""
    this.registerName = ""
    this.registerConfirmPassword = ""
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: "bottom",
    })
    await toast.present()
  }

  dismissToast() {
    this.showToastMessage = false
  }
}