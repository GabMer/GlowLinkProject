import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { RouteReuseStrategy } from "@angular/router"
import { LightControlPage } from "./pages/light-control/light-control.page"
import { IonicModule, IonicRouteStrategy } from "@ionic/angular"
import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./app-routing.module"
import { FilterByPipe } from "./pipes/filter-by.pipe"
import { HttpClientModule } from "@angular/common/http"
import { RouterModule } from "@angular/router"
// Plugins de Cordova
import { routes } from "./app.routes"
import { PreloadAllModules } from "@angular/router"

@NgModule({
  declarations: [AppComponent, LightControlPage, FilterByPipe],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [FilterByPipe],
})
export class AppModule { }
