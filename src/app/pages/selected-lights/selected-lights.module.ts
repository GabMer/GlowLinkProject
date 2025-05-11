import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { SelectedLightsPage } from "./selected-lights.page"

const routes: Routes = [
  {
    path: "",
    component: SelectedLightsPage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SelectedLightsPage
  ],
})
export class SelectedLightsPageModule {}