import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, type Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"

const routes: Routes = [
  {
    path: "home",
    loadChildren: () => import("./pages/welcome/welcome.module").then((m) => m.WelcomePageModule),
  },
  {
    path: "auth",
    loadChildren: () => import("./pages/auth/auth.module").then((m) => m.AuthPageModule),
  },
  {
    path: "shows",
    loadChildren: () => import("./pages/shows/shows.module").then((m) => m.ShowsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: "light-control",
    loadChildren: () => import("./pages/light-control/light-control.module").then((m) => m.LightControlPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: "selected-lights",
    loadChildren: () =>
      import("./pages/selected-lights/selected-lights.module").then((m) => m.SelectedLightsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: "connection",
    loadChildren: () => import("./pages/connection/connection.module").then((m) => m.ConnectionPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}