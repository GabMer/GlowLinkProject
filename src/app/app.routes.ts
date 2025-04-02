import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: 'light-control',
    loadComponent: () =>
      import('./pages/light-control/light-control.page').then(m => m.LightControlPage),
  },
  {
    path: "selected-lights",
    loadComponent: () => import("./pages/selected-lights/selected-lights.page").then((m) => m.SelectedLightsPage),
  },
  {
    path: "",
    redirectTo: "light-control",
    pathMatch: "full",
  },
]

