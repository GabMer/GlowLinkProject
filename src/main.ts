import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { RouteReuseStrategy, provideRouter } from "@angular/router";
import { IonicRouteStrategy } from "@ionic/angular/standalone";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";
import "@angular/compiler"
import { addIcons } from 'ionicons';
import { IonicModule } from "@ionic/angular";
import { provideIonicAngular } from '@ionic/angular/standalone';
import {
  chevronForward,
  colorPalette,
  options,
  musicalNotes,
  sunnyOutline
} from 'ionicons/icons';

addIcons({
  'chevron-forward': chevronForward,
  'color-palette': colorPalette,
  'options': options,
  'musical-notes': musicalNotes,
  'sunny-outline': sunnyOutline
});


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
  ],
}).catch((err) => console.log(err));
