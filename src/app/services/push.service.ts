import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { EventEmitter, Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  // messages: any[] = [
  //   {
  //     title: 'Titulo de la push',
  //     body: 'Body del push',
  //     date: new Date()
  //   }
  // ];
  messages: OSNotificationPayload[] = [];
  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();
  constructor(private oneSignal: OneSignal, private storage: Storage) { 
    this.initializeDatabase();
    this.loadMessages();
  }

  async initializeDatabase() {
    await this.storage.create();
  }
  initialConfigurations() {
    this.oneSignal.startInit('0e15b43e-1a60-4af3-a2d0-8742a4bd9da2','140675409988');
    
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    
    this.oneSignal.handleNotificationReceived().subscribe((resp) => {
     // do something when notification is received
     console.log('notificacion recibida ->', resp);
     this.notificationReceived(resp);
    });
    
    this.oneSignal.handleNotificationOpened().subscribe( async(resp) => {
      // do something when a notification is opened
     console.log('notificacion abierta ->', resp);
     await this.notificationReceived(resp.notification);
    });
    
    this.oneSignal.getIds().then((ids) => {
      this.userId = ids.userId;
    })

    this.oneSignal.endInit();
  }

  async notificationReceived(noti: OSNotification) {
    await this.loadMessages();
    const payload = noti.payload
    const existePush = this.messages.find ( mss => mss.notificationID === payload.notificationID );
    if(existePush) {
      return;
    } 
    this.messages.unshift(payload);
    this.pushListener.emit(payload);
    await this.saveMessages();
  }

  saveMessages() {
    this.storage.set('messages', this.messages);
  }

  async loadMessages() {
    this.messages = await this.storage.get('messages') || [];
    return this.messages;
  }

  async getMessages() {
    await this.loadMessages();
    return [...this.messages];
  }
  getUser(){
    console.log('userId ->', this.userId);
    return this.userId;
  }

  async removeMessages() {
    this.messages = [];
    await this.storage.remove('message');
  }
}
