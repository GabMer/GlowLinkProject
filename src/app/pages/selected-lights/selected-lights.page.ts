import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { Subscription } from "rxjs"
import { Light } from "../../models/light.model"
import { LightService } from "../../services/light.service"

// Importar componentes Ionic desde standalone
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonFooter,
    IonBackButton,
    ToastController,
} from "@ionic/angular/standalone"

// Importar addIcons para los iconos
import { addIcons } from "ionicons"
import { bulbOutline, bulb, arrowBack, contrastOutline, flashOutline } from "ionicons/icons"

@Component({
    selector: "app-selected-lights",
    templateUrl: "./selected-lights.page.html",
    styleUrls: ["./selected-lights.page.scss"],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonItem,
        IonLabel,
        IonFooter,
        IonBackButton,
    ],
})


export class SelectedLightsPage implements OnInit, OnDestroy {
    selectedLights: Light[] = []
    private subscription: Subscription | null = null

    constructor(
        private lightService: LightService,
        private router: Router,
        private toastController: ToastController,
    ) {
        // Registrar los iconos
        addIcons({
            flashOutline,
            contrastOutline,
            arrowBack,
            bulbOutline,
            bulb,
        });
    }

    ngOnInit() {
        this.subscription = this.lightService.lights$.subscribe((lights) => {
            this.selectedLights = lights.filter((light) => light.selected)

            if (this.selectedLights.length === 0) {
                this.showToast("No hay luces seleccionadas")
                this.router.navigate(["/light-control"])
            }
        })
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe()
        }
    }

    /**
     * Muestra un mensaje toast
     */
    async showToast(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: "bottom",
        })
        await toast.present()
    }

    /**
     * Enciende todas las luces seleccionadas
     */
    turnAllSelectedOn(): void {
        const lights = this.lightService.getLights()
        const updatedLights = lights.map((light) => (light.selected ? { ...light, isOn: true } : light))
        this.lightService.lightsSubject.next(updatedLights)
        this.showToast("Todas las luces seleccionadas encendidas")
    }

    /**
     * Apaga todas las luces seleccionadas
     */
    turnAllSelectedOff(): void {
        const lights = this.lightService.getLights()
        const updatedLights = lights.map((light) => (light.selected ? { ...light, isOn: false } : light))
        this.lightService.lightsSubject.next(updatedLights)
        this.showToast("Todas las luces seleccionadas apagadas")
    }
}

