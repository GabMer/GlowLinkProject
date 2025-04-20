import { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"

export const routes: Routes = [
  {
    path: "light-control",
    loadComponent: () => import("./pages/light-control/light-control.page").then((m) => m.LightControlPage),
    canActivate: [AuthGuard], // Proteger esta ruta
  },
  {
    path: "welcome",
    loadComponent: () => import("./pages/welcome/welcome.page").then((m) => m.WelcomePage),
  },
  {
    path: "auth/:mode",
    loadComponent: () => import("./pages/auth/auth.page").then((m) => m.AuthPage),
  },
  {
    path: "selected-lights",
    loadComponent: () => import("./pages/selected-lights/selected-lights.page").then((m) => m.SelectedLightsPage),
    canActivate: [AuthGuard], // Proteger esta ruta
  },
  {
    path: "",
    redirectTo: "welcome",
    pathMatch: "full",
  },
]

