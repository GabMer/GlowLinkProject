import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule, ToastController } from "@ionic/angular"
import { Router } from "@angular/router"
import type { Subscription } from "rxjs"
import { FilterByPipe } from "../filter-by.pipe"  // Cambia la ruta de importación

import { LightService } from "../../services/light.service"
// ... resto del código igual ...

@Component({
  selector: "app-music-sync",
  standalone: true,
  templateUrl: "./music-sync.page.html",
  styleUrls: ["./music-sync.page.scss"],
  imports: [CommonModule, FormsModule, IonicModule, FilterByPipe],
})
export class MusicSyncPage implements OnInit, OnDestroy {
  // ... resto del código igual ...
}