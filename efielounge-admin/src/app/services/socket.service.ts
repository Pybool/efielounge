import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { BehaviorSubject, take } from 'rxjs';
import { Howl } from 'howler';
import { ChatService } from './chat.service';
let self:any
let context: AudioContext;
declare var webkitAudioContext: any;

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public notificationsIntervalId: any = null;
  public notifications: any[] = [];

  public notificationsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.notifications
  );
  private sound: Howl | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private chatService: ChatService
  ) {
    self = this
    const audioCtx = this.getContext();
    this.unlockAudioContext(audioCtx);
    setTimeout(() => {
      self.sound = new Howl({
        src: ['/assets/efielounge/sounds/neworder.wav'],
        format: ['wav'],
      });
    }, 5000);
  }

  getContext() {
    const _window: any = window;
    return new (_window.AudioContext || _window?.webkitAudioContext)();
  }

  unlockAudioContext(context: { state: string; resume: () => Promise<any> }) {
    if (context.state !== 'suspended') return;
    const b = document.body;
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    events.forEach((e) => b.addEventListener(e, unlock, false));
    function unlock() {
      context.resume().then(clean);
    }
    function clean() {
      events.forEach((e) => b.removeEventListener(e, unlock));
    }
  }

  connectToSocket() {
    const _window: any = window as any;
    const io = _window.io;
    const token = this.tokenService.retrieveToken();
    const socket = io(`${environment.api}/?token=${token}`, {
      auth: {
        token: token, // Replace with the token you received
      },
    });

    socket.on('connect', () => {
      console.log('Connected to notification socket');
    });

    socket.on('connect_error', (error:any) => {
        console.log('Failed to connect the server', error.toString());
        if(error.toString().includes('Token Error')){
            if(!document.location.href.includes("/login")){
                document.location.href="/login"
            }
            
        }
      });

    socket.on('disconnect', (msg:any) => {
        console.log('Disconnected from the server ', msg);
    });


    socket.on('notifications', (rawNotification: string) => {
      try {
        const notification = JSON.parse(rawNotification);
        console.log("notification ", notification)
        if (notification?.title?.includes('new order')) {
          window.localStorage.setItem('notification', notification.message);

          new Notification('Efielounge Order', {
            body: window.localStorage.getItem('notification')!,
            icon: '/assets/efielounge/logo.png',
            requireInteraction: true
          });
          if (!this.notificationsIntervalId) {
            const intervalId = setInterval(() => {
              this.sound!.play();
            }, 2500);
            this.notificationsIntervalId = intervalId;
          }
          this.updateNotifications(notification);
        }else{
          this.chatService.updateChatPreviewByNotifications(notification.chatPreview)
          window.localStorage.setItem('notification', notification.message);
          const href = document.location.href as string;
          if(!href.includes("#/chats")){
            new Notification('Efielounge Chat', {
              body: window.localStorage.getItem('notification')!,
              icon: '/assets/efielounge/logo.png',
              requireInteraction: true
            });
          }
          
          this.updateNotifications(notification);
        }
      } catch (error: any) {
        console.log(error);
      }
    });
  }

  stopAlert() {
    clearInterval(this.notificationsIntervalId);
    this.notificationsIntervalId = null;
  }

  fetchNotificationsObs() {
    this.fetchNotifications()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.notifications = response.data;
            this.notificationsSubject.next(this.notifications);
          }
        },
        (error: any) => {
          console.log('Failed to fetch notifications');
        }
      );

    return this.notificationsSubject.asObservable();
  }

  updateNotifications(notification: any) {
    this.notifications.unshift(notification);
    this.notificationsSubject.next(this.notifications);
  }

  fetchNotifications() {
    return this.http.get(`${environment.api}/api/v1/admin/notifications`);
  }

  getNotificationById() {}
}
