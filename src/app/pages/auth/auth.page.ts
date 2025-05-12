import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule, ToastController } from "@ionic/angular"
import { addIcons } from "ionicons"
import { mailOutline, lockClosedOutline, personOutline, arrowBack } from "ionicons/icons"
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
  activeTab = "login"

  // Datos de formulario
  loginEmail = ""
  loginPassword = ""
  registerName = ""
  registerEmail = ""
  registerPassword = ""
  registerConfirmPassword = ""

  // Estados de UI
  isLoading = false
  errorMessage = ""
  showToast = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
  ) {
    // Registrar los iconos
    addIcons({
      "mail-outline": mailOutline,
      "lock-closed-outline": lockClosedOutline,
      "person-outline": personOutline,
      "arrow-back": arrowBack,
    })
  }

  ngOnInit() {
    // Obtener el modo de la URL (login o register)
    this.route.params.subscribe((params) => {
      if (params["mode"]) {
        this.activeTab = params["mode"]
      }
    })
  }

  handleTabChange(event: any) {
    const value = event.detail.value
    this.activeTab = value
    this.router.navigate(["/auth", value])
  }

  async handleLogin() {
    if (!this.validateLoginForm()) {
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    try {
      await this.authService.login(this.loginEmail, this.loginPassword).toPromise()
      this.router.navigate(["/home"])
    } catch (error: any) {
      this.handleAuthError(error)
    } finally {
      this.isLoading = false
    }
  }

  async handleRegister() {
    if (!this.validateRegisterForm()) {
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    try {
      await this.authService.register(this.registerEmail, this.registerPassword).toPromise()
      this.showSuccessToast("Cuenta creada exitosamente")
      this.router.navigate(["/home"])
    } catch (error: any) {
      this.handleAuthError(error)
    } finally {
      this.isLoading = false
    }
  }

  async handleForgotPassword() {
    if (!this.loginEmail) {
      this.errorMessage = "Por favor, ingresa tu correo electrónico"
      this.showToast = true
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    try {
      await this.authService.resetPassword(this.loginEmail).toPromise()
      this.showSuccessToast("Se ha enviado un correo para restablecer tu contraseña")
    } catch (error: any) {
      this.handleAuthError(error)
    } finally {
      this.isLoading = false
    }
  }

  private validateLoginForm(): boolean {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = "Por favor, completa todos los campos"
      this.showToast = true
      return false
    }
    return true
  }

  private validateRegisterForm(): boolean {
    if (!this.registerName || !this.registerEmail || !this.registerPassword || !this.registerConfirmPassword) {
      this.errorMessage = "Por favor, completa todos los campos"
      this.showToast = true
      return false
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage = "Las contraseñas no coinciden"
      this.showToast = true
      return false
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage = "La contraseña debe tener al menos 6 caracteres"
      this.showToast = true
      return false
    }

    return true
  }

  private handleAuthError(error: any) {
    console.error("Error de autenticación:", error)

    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        this.errorMessage = "Correo o contraseña incorrectos"
        break
      case "auth/email-already-in-use":
        this.errorMessage = "Este correo ya está registrado"
        break
      case "auth/invalid-email":
        this.errorMessage = "Correo electrónico inválido"
        break
      case "auth/weak-password":
        this.errorMessage = "La contraseña es demasiado débil"
        break
      default:
        this.errorMessage = "Ocurrió un error. Inténtalo de nuevo."
    }

    this.showToast = true
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: "success",
      position: "bottom",
    })
    await toast.present()
  }
}

export default AuthPage
