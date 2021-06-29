import { ApplicationRef, Component } from '@angular/core';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  messages: OSNotificationPayload[] = [];
  userId: string;
  constructor( private pushService: PushService,
               private applicationRef: ApplicationRef) {  }

  ngOnInit() {
    this.pushService.pushListener.subscribe( noti => {
      this.messages.unshift(noti);
      this.applicationRef.tick();
    })
  }

  async ionViewWillEnter() {
    console.log('entrando a cargar');
    this.userId = this.pushService.getUser() || 'invalido';
    this.messages = await this.pushService.getMessages();
  }

  async removeMessages() {
    await this.pushService.removeMessages();
    this.messages = [];
  }

}

