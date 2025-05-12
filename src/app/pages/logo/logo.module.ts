import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule, Routes } from "@angular/router"
import { WelcomePage } from "./logo.page"

const routes: Routes = [
  {
    path: "",
    component: WelcomePage,
  },
]

@NgModule({
  imports: [CommonModule, WelcomePage, IonicModule, RouterModule.forChild(routes)]
})
export class WelcomePageModule {}
