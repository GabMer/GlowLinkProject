import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { RoomPlayerPage } from './pages/room-player/room-player.page';

const routes: Routes = [
  {
    path: "logo",
    loadChildren: () => import("./pages/logo/logo.module").then((m) => m.WelcomePageModule),
  },
  {
    path: "home",
    loadChildren: () => import("./pages/home/home.page").then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },

  {
    path: "welcome",
    loadComponent: () => import("./pages/welcome/welcome.page").then((m) => m.WelcomePage),
  },
  {
    path: "auth/:mode",
    loadComponent: () => import("./pages/auth/auth.page").then((m) => m.AuthPage),
  },
  {
    path: "selected-lights",
    loadComponent: () => import("./pages/selected-lights/selected-lights.page").then((m) => m.SelectedLightsPage),
    canActivate: [AuthGuard],
  },
  { path: 'room-player/:roomCode', component: RoomPlayerPage },
  {
    path: 'waiting-room/:code',
    loadComponent: () => import('./pages/waiting-room/waiting-room.page').then(m => m.WaitingRoomPage)
  },
  {
    path: "",
    redirectTo: "logo",
    pathMatch: "full",
  },

]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
