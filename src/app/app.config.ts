import type { ApplicationConfig } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideIonicAngular, IonicRouteStrategy } from "@ionic/angular/standalone"
import { RouteReuseStrategy } from "@angular/router"
import { provideHttpClient } from "@angular/common/http"
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx"
import { Media } from "@awesome-cordova-plugins/media/ngx"

import { routes } from "./app.routes"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    AndroidPermissions,
    Media,
  ],
}
