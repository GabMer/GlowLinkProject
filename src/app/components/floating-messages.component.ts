import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RandomMessagesService } from "../services/random-messages.service";
import { RandomMessage } from "../models/light.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-floating-messages",
  templateUrl: "./floating-messages.component.html",
  styleUrls: ["./floating-messages.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class FloatingMessagesComponent implements OnInit, OnDestroy {
  messages: RandomMessage[] = [];
  private subscription: Subscription | null = null;

  constructor(private randomMessagesService: RandomMessagesService) {}

  ngOnInit() {
    this.subscription = this.randomMessagesService.messages$.subscribe(
      (messages: RandomMessage[]) => {
        this.messages = messages;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getMessageStyle(message: RandomMessage) {
    return {
      'background-color': message.color,
      'animation-duration': `${message.duration}ms`
    };
  }

  trackByMessageId(index: number, message: RandomMessage): string {
    return message.id;
  }
}