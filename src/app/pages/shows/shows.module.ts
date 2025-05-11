import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { ShowsPage } from "./shows.page"

const routes: Routes = [
  {
    path: "",
    component: ShowsPage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ShowsPage
  ],
})
export class ShowsPageModule {}