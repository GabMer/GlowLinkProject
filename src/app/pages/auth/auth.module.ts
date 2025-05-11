import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { AuthPage } from "./auth.page"

const routes: Routes = [
  {
    path: "",
    component: AuthPage,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AuthPage
  ],
})
export class AuthPageModule {}