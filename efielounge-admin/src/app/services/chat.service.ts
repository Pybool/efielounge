import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public messages: any[] = [];
  public chatsPreviews: any[] = [];
  public chatsPreviewPage = 0;
  public activeRoom: string | null = null;
  public messagesSubject: BehaviorSubject<any> = new BehaviorSubject<any>({
    messages: this.messages,
    paginationData: { page: 1, totalPages: 0 },
  });
  public customerReps: any[] = [];
  public customerRepsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.customerReps
  );
  public chatsPreviewsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.chatsPreviews
  );
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  reInitialize() {
    this.messages = [];
    this.messagesSubject.next({
      messages: this.messages,
      paginationData: null,
    });
  }

  connectToSocket(deviceId: string | null) {
    const _window: any = window as any;
    const io = _window.io;
    let token = this.tokenService.retrieveToken('efielounge-accessToken');
    const user = this.authService.retrieveUser();
    console.log('Socket User ', user);
    const socket = io(`${environment.api}`, {
      auth: {
        token: token, // Replace with the token you received
        deviceId: deviceId,
      },
    });

    socket.on('connection', () => {
      console.log('Connected to the chat server');
    });

    socket.on('connect_error', (error: any) => {
      console.log('Failed to connect the server', error.toString());
      alert('Failed to initilaize chat');
    });

    socket.on('disconnect', (msg: any) => {
      console.log('Disconnected from the chat server ', msg);
    });

    socket.on('message', (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Parsed Message => ', parsedMessage);
        this.messages.push(parsedMessage);
        this.messagesSubject.next(this.messages);
        this.scrollDown();
      } catch (error: any) {
        console.log(error);
      }
    });

    return socket;
  }

  public getObjectById(array: any, id: string | undefined) {
    return array.find((item: { _id: string }) => item._id === id);
  }

  public scrollDown() {
    const chatContainer = document.querySelector('.lc-1n5mfq1') as HTMLElement;
    if (!chatContainer) {
      console.error('Chat container not found');
      return;
    }

    // Scroll to bottom by default
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  sendMessage(payload: {
    message: string;
    publisher: string | null;
    room: string | null;
    token: string | null;
  }): Observable<boolean> {
    return this.http
      .post(`${environment.api}/api/v1/chats/send-message`, payload)
      .pipe(
        take(1),
        map((response: any) => {
          console.log(response);
          if (response.status) {
            if (
              !this.getObjectById(this.messages, response?.chatMessage?._id)
            ) {
              this.messages.push(response.chatMessage);
              this.messagesSubject.next({
                messages: this.messages,
                paginationData: null,
              });
              this.scrollDown();
            }

            return true;
          }
          return false;
        }),
        catchError((error: any) => {
          console.error('Error sending message:', error);
          return of(false);
        })
      );
  }

  getCustomerReps() {
    this.getCustomerRepsRequest()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.customerReps = response.data;
            this.customerRepsSubject.next(this.customerReps);
          }
        },
        (error: any) => {
          console.log('Failed to fetch notifications');
        }
      );

    return this.customerRepsSubject.asObservable();
  }

  updateChatPreviewByNotifications(chatPreview: any) {
    console.log('Re-arranging ', chatPreview);

    // Find the index of the matching chat preview by publisher ID
    const existingIndex = this.chatsPreviews.findIndex(
      (item: any) => item.publisher === chatPreview.publisher
    );

    if (existingIndex === -1) {
      this.chatsPreviews.unshift(chatPreview);
    } else {
      this.chatsPreviews.splice(existingIndex, 1);
      this.chatsPreviews.unshift(chatPreview);
    }

    this.chatsPreviewsSubject.next({
      status: true,
      chatsPreviews: this.chatsPreviews,
      paginationData: {},
    });

    if (chatPreview?.messages?.room === this.activeRoom) {
      this.markChatAsRead({ roomId: this.activeRoom })
        .pipe(take(1))
        .subscribe((response: any) => {
          if (response.status) {
            chatPreview.unreadChatsCount = 0;
          }
        });
    }
  }

  getChats(roomId: string | null, page: number, pageSize: number) {
    const chatsRequest = this.http.get(
      `${environment.api}/api/v1/chats/get-chats?roomId=${roomId}&page=${page}&limit=${pageSize}`
    );
    chatsRequest.pipe(take(1)).subscribe(
      (response: any) => {
        if (response.status) {
          page++;
          const paginationData = {
            page: page,
            totalPages: response.totalPages,
          };
          this.messages.unshift(...response.data.reverse());
          this.messagesSubject.next({
            status: response.status,
            messages: this.messages,
            paginationData,
          });
        }
      },
      (error) => {
        alert('Failed to fetch chats');
      }
    );
    return this.messagesSubject.asObservable();
  }

  fetchChatsPreview() {
    const chatsPreviewRequest = this.fetchChatsPreviewRequest();
    chatsPreviewRequest.pipe(take(1)).subscribe(
      (response: any) => {
        if (response.status) {
          this.chatsPreviewPage++;
          const paginationData = {
            page: this.chatsPreviewPage,
            totalPages: response.totalPages,
          };
          this.chatsPreviews.unshift(...response.data.reverse());
          this.chatsPreviewsSubject.next({
            status: response.status,
            chatsPreviews: this.chatsPreviews,
            paginationData,
          });
        }
      },
      (error) => {
        alert('Failed to fetch chats');
      }
    );
    return this.chatsPreviewsSubject.asObservable();
  }

  getCustomerRepsRequest() {
    return this.http.get(`${environment.api}/api/v1/admin/get-customer-reps`);
  }

  fetchChatsPreviewRequest() {
    return this.http.get(`${environment.api}/api/v1/chats/fetch-chats-preview`);
  }

  fetchRooms() {
    return this.http.get(`${environment.api}/api/v1/chats/fetch-rooms`);
  }

  getChatToken(payload: any) {
    return this.http.post(`${environment.api}/api/v1/get-chat-token`, payload);
  }

  markChatAsRead(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/chats/read-chats`,
      payload
    );
  }

  getNotificationById() {}
}
