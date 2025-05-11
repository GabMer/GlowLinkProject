import { Injectable } from "@angular/core"
import { Router, type CanActivate } from "@angular/router"

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  // Por simplicidad, asumimos que el usuario está autenticado
  private isAuthenticated = true

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (this.isAuthenticated) {
      return true
    } else {
      this.router.navigate(["/auth"])
      return false
    }
  }
}