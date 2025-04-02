import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, type Routes } from "@angular/router"

const routes: Routes = [
  {
    path: "light-control",
    loadChildren: () => import("./pages/light-control/light-control.module").then((m) => m.LightControlPageModule),
  },
  {
    path: "",
    redirectTo: "light-control",
    pathMatch: "full",
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

