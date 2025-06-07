<<<<<<< Updated upstream
import type { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
=======
import { Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
>>>>>>> Stashed changes

export const routes: Routes = [
  {
    path: "logo",
    loadChildren: () => import("./pages/logo/logo.module").then((m) => m.WelcomePageModule),
  },
  {
    path: "tutorial",
    loadComponent: () => import("./pages/tutorial/tutorial.page").then((m) => m.TutorialPage),
  },
  {
    path: "home",
    loadComponent: () => import("./pages/home/home.page").then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: "light-control",
    loadComponent: () => import("./pages/light-control/light-control.page").then((m) => m.LightControlPage),
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
  {
    path: "music-sync",
    loadComponent: () => import("./pages/music-sync/music-sync.page").then((m) => m.MusicSyncPage),
    canActivate: [AuthGuard],
  },
  {
    path: "preset-modes",
    loadComponent: () => import("./pages/preset-modes/preset-modes.page").then((m) => m.PresetModesPage),
    canActivate: [AuthGuard],
  },
  {
<<<<<<< Updated upstream
    path: "room/:id",
    loadComponent: () => import("./pages/room/room.page").then((m) => m.RoomPage),
    canActivate: [AuthGuard],
  },
  {
=======
    path: "room-player/:id",
    loadComponent: () => import("./pages/room-player/room-player.page").then((m) => m.RoomPlayerPage),
  },
  {
    path: "waiting-room",
    loadComponent: () => import("./pages/waiting-room/waiting-room.page").then((m) => m.WaitingRoomPage),
  },
  {
    path: "waiting-room/:code",
    loadComponent: () => import("./pages/waiting-room/waiting-room.page").then((m) => m.WaitingRoomPage),
  },
  // Ruta por defecto, cuando alguien va a "/"
  {
>>>>>>> Stashed changes
    path: "",
    redirectTo: "tutorial",
    pathMatch: "full",
  },
<<<<<<< Updated upstream
]
=======
  // "Catch-all" para cualquier otra URL no definida
  {
    path: "**",
    redirectTo: "/home",
    pathMatch: "full"
  },
];
>>>>>>> Stashed changes
