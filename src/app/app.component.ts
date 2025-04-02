import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive } from "@angular/router"

// Importar componentes Ionic desde standalone
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone"

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}
}

