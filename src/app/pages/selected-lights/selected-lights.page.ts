import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { LightService } from "../../services/light.service"
import { type Light } from "../../models/light.model"

@Component({
  selector: "app-selected-lights",
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: "./selected-lights.page.html",
  styleUrls: ["./selected-lights.page.scss"],
})
export class SelectedLightsPage implements OnInit {
  connectedLights: Light[] = []

  constructor(
    private lightService: LightService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.lightService.getConnectedLights().subscribe((lights) => {
      this.connectedLights = lights
    })
  }

  goBack() {
    this.router.navigateByUrl("/light-control")
  }

  disconnectLight(lightId: string) {
    this.lightService.disconnectLight(lightId)
  }

  disconnectAll() {
    this.connectedLights.forEach((light) => {
      this.lightService.disconnectLight(light.id)
    })
  }
}

export default SelectedLightsPage