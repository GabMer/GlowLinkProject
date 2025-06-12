import type { ApplicationConfig } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideIonicAngular, IonicRouteStrategy } from "@ionic/angular/standalone"
import { RouteReuseStrategy } from "@angular/router"
import { provideHttpClient } from "@angular/common/http"
import { Media } from '@capacitor-community/media';
import { HttpClientModule } from '@angular/common/http';



import { routes } from "./app.routes"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(),
    
  ],
}
