import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { LightControlPage } from "./light-control.page"

const routes: Routes = [
  {
    path: "",
    component: LightControlPage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    LightControlPage
  ],
})
export class LightControlPageModule {}