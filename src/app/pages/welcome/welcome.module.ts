import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { WelcomePage } from "./welcome.page"

const routes: Routes = [
  {
    path: "",
    component: WelcomePage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    WelcomePage
  ],
})
export class WelcomePageModule {}