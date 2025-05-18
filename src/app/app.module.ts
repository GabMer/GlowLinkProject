import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from "@angular/platform-browser"
import { RouteReuseStrategy } from "@angular/router"
import { LightControlPage } from './pages/light-control/light-control.page';
import { IonicModule, IonicRouteStrategy } from "@ionic/angular"
import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./app-routing.module"
import { FilterByPipe } from './pipes/filter-by.pipe'; 
import { HttpClientModule } from "@angular/common/http"

// Plugins de Cordova
import { File } from "@awesome-cordova-plugins/file/ngx"
import { Media } from "@awesome-cordova-plugins/media/ngx"
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx"


@NgModule({
  declarations: [AppComponent,LightControlPage, FilterByPipe ],
  imports: [ BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, File, Media, AndroidPermissions],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [FilterByPipe],
})
export class AppModule {}

