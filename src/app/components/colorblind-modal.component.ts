import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule, ModalController } from "@ionic/angular";
import { ColorblindService } from "../services/colorblind.service";
import { ColorblindSettings } from "../models/light.model";
import { addIcons } from "ionicons";
import { 
  eyeOutline, 
  eyeOffOutline, 
  checkmarkCircleOutline, 
  closeOutline,
  informationCircleOutline,
  removeOutline,
  addOutline
} from "ionicons/icons";

@Component({
  selector: "app-colorblind-modal",
  templateUrl: "./colorblind-modal.component.html",
  styleUrls: ["./colorblind-modal.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ColorblindModalComponent implements OnInit {
  colorblindType: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' = 'normal';
  intensity = 50;

  constructor(
    private modalController: ModalController,
    private colorblindService: ColorblindService
  ) {
    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-outline': closeOutline,
      'information-circle-outline': informationCircleOutline,
      'remove-outline': removeOutline,
      'add-outline': addOutline
    });
  }

  ngOnInit() {}

  selectNormalVision() {
    this.colorblindType = 'normal';
    this.applySettings();
  }

  selectColorblindType(type: 'protanopia' | 'deuteranopia' | 'tritanopia') {
    this.colorblindType = type;
    this.applySettings();
  }

  private applySettings() {
    const settings: ColorblindSettings = {
      enabled: this.colorblindType !== 'normal',
      type: this.colorblindType,
      intensity: this.intensity
    };

    this.colorblindService.setColorblindMode(settings);
    this.modalController.dismiss(settings);
  }

  onIntensityChange() {
    if (this.colorblindType !== 'normal') {
      const settings: ColorblindSettings = {
        enabled: true,
        type: this.colorblindType,
        intensity: this.intensity
      };
      this.colorblindService.setColorblindMode(settings);
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}