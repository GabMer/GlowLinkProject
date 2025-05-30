import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router"
// Importar componentes Ionic desde standalone
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone"

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, RouterOutlet],
})
export class AppComponent {
  constructor() { }
  ngOnInit() {
    const sensitivityMode = localStorage.getItem("sensitivityMode");
    if (sensitivityMode === "true") {
      document.body.classList.add("sensitivity-mode");
    }
  }
}

