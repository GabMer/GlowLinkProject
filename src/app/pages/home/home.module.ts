import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule, Routes } from "@angular/router"
import { HomePage } from "./home.page"

const routes: Routes = [
  {
    path: "",
    component: HomePage,
  },
]

@NgModule({
  imports: [CommonModule,HomePage, IonicModule, RouterModule.forChild(routes)]
  
})
export class HomePageModule {}
