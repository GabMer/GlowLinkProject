import type { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "light-control",
    loadComponent: () => import("./pages/light-control/light-control.page").then((m) => m.LightControlPage),
  },
  {
    path: "",
    redirectTo: "light-control",
    pathMatch: "full",
  },
]

