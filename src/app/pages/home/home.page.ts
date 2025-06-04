import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { LightService } from "../../services/light.service"
import { IonicModule } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { addIcons } from "ionicons"
import { colorPalette, options, musicalNotes, bluetooth, chevronForward, enterOutline } from "ionicons/icons"
import { JoinRoomModalComponent } from "../../components/join-room-modal/join-room-modal.component"
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage {
  shows = [
    {
      id: "default",
      name: "Predeterminado",
      description: "Colores y efectos definidos previamente",
      icon: "color-palette",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: "custom",
      name: "Personalizado",
      description: "El usuario elige color y brillo",
      icon: "options",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
    {
      id: "music",
      name: "Sincronizado con música",
      description: "Los efectos se adaptan al ritmo",
      icon: "musical-notes",
      color: "#1a1a1a",
      iconColor: "#ff0000",
      textColor: "#ffffff",
    },
  ]

  constructor(
    private router: Router,
    private lightService: LightService,
    private modalCtrl: ModalController,
  ) {

    addIcons({
      "color-palette": colorPalette,
      options: options,
      "musical-notes": musicalNotes,
      bluetooth: bluetooth,
      "chevron-forward": chevronForward,
      "enter-outline": enterOutline,
    })
  }



  // Asegurar que la navegación al modo música funcione correctamente
  selectShow(showId: string) {
    console.log("Seleccionado:", showId)

    // Establecer el modo seleccionado
    this.lightService.setMode(showId)

    // Redirigir según el modo seleccionado
    if (showId === "music") {
      // Para el modo música, redirigir a la página de sincronización con música
      this.router.navigate(["/music-sync"])
    } else if (showId === "default") {
      // Para el modo predeterminado, redirigir a la página de modos predeterminados
      this.router.navigate(["/preset-modes"])
    } else {
      // Para otros modos, redirigir al control de luces normal
      this.router.navigate(["/light-control"])
    }
  }

  /**
   * Navega a la página para unirse a una sala existente
   */
  async joinExistingRoom() {
    const modal = await this.modalCtrl.create({
      component: JoinRoomModalComponent,
      backdropDismiss: true,  // Permite cerrar modal tocando fuera
      cssClass: 'custom-modal', // clase CSS personalizada

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      // Aquí recibes el código o link ingresado
      const roomCode = this.extractRoomCode(data); // función para extraer código si es link
      this.router.navigate(['/waiting-room', roomCode]);
    }
  }

  extractRoomCode(input: string): string {
    // Si es un link, extrae el código. Si es código directo, retorna tal cual
    // Ejemplo básico:
    try {
      const url = new URL(input);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch {
      return input;
    }
  }

}
