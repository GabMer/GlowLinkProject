import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IonicModule, ToastController, AlertController } from "@ionic/angular";
import { RoomService } from "../../services/room.service";
import { RandomMessagesService } from "../../services/random-messages.service";
import { FloatingMessagesComponent } from "../../components/floating-messages.component";
import { Room, RoomMessage } from "../../models/light.model";
import { Subscription } from "rxjs";
import { addIcons } from "ionicons";
import { 
  qrCodeOutline, 
  shareOutline, 
  peopleOutline, 
  exitOutline,
  copyOutline,
  checkmarkOutline,
  bulbOutline,
  musicalNoteOutline,
  trashOutline
} from "ionicons/icons";

@Component({
  selector: "app-room",
  templateUrl: "./room.page.html",
  styleUrls: ["./room.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FloatingMessagesComponent],
})
export class RoomPage implements OnInit, OnDestroy {
  room: Room | null = null;
  roomId: string = '';
  isHost = false;
  qrCodeData = '';
  showQRCode = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private randomMessagesService: RandomMessagesService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      'qr-code-outline': qrCodeOutline,
      'share-outline': shareOutline,
      'people-outline': peopleOutline,
      'exit-outline': exitOutline,
      'copy-outline': copyOutline,
      'checkmark-outline': checkmarkOutline,
      'bulb-outline': bulbOutline,
      'musical-note-outline': musicalNoteOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    
    this.subscriptions.push(
      this.roomService.currentRoom$.subscribe((room: Room | null) => {
        this.room = room;
        if (room) {
          this.generateQRCode();
        }
      }),
      
      this.roomService.isHost$.subscribe((isHost: boolean) => {
        this.isHost = isHost;
      })
    );

    this.randomMessagesService.startRandomMessages();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.randomMessagesService.stopRandomMessages();
  }

  generateQRCode() {
    if (this.room) {
      const joinUrl = `${window.location.origin}/room/${this.room.id}`;
      this.qrCodeData = joinUrl;
    }
  }

  async shareRoom() {
    if (!this.room) return;

    const shareData = {
      title: `Únete a la sala: ${this.room.name}`,
      text: `Código de sala: ${this.room.id}`,
      url: `${window.location.origin}/room/${this.room.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        this.showToast('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  }

  async copyRoomCode() {
    if (!this.room) return;

    try {
      await navigator.clipboard.writeText(this.room.id);
      this.showToast('Código de sala copiado');
    } catch (error) {
      this.showToast('No se pudo copiar el código');
    }
  }

  toggleQRCode() {
    this.showQRCode = !this.showQRCode;
  }

  async leaveRoom() {
    const alert = await this.alertController.create({
      header: 'Salir de la sala',
      message: '¿Estás seguro de que quieres salir de la sala?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: async () => {
            await this.roomService.leaveRoom();
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteRoom() {
    if (!this.isHost || !this.room) return;

    const alert = await this.alertController.create({
      header: 'Eliminar sala',
      message: '¿Estás seguro de que quieres eliminar la sala? Todos los participantes serán desconectados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.roomService.deleteRoom(this.room!.id);
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}