import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { ConnectionPage } from "./connection.page"

const routes: Routes = [
  {
    path: "",
    component: ConnectionPage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ConnectionPage
  ],
})
export class ConnectionPageModule {}