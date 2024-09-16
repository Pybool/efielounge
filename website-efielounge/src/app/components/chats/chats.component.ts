import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { debounceTime, filter, fromEvent, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeviceIdService } from '../../services/fingerprint.service';
import { FormsModule } from '@angular/forms';
import { RisingDotComponent } from '../rising-dot/rising-dot.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, FormsModule, RisingDotComponent, PickerComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss',
})
export class ChatsComponent {
  public customerReps: any[] = [];
  public chats: any[] = [];
  public serverUrl: string = environment.api;
  public activeCustomerRep: any = {};
  public chatToken: string | null = null;
  public deviceId: string | null = null;
  public socket: any;
  public activeRoom: string | null = null;
  public message: string = '';
  public loading: boolean = false;
  public scrollSubscription: any;
  public page: number = 1;
  public totalPages: number = 0;
  public pageSize = 3;
  public initChats: boolean = false;
  public scrollPosition: any;
  public threshold: any;
  public initScroll: boolean = false;
  public showEmojiPicker: boolean = false;
  public activeChatsPreview: any;
  public user: any = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private deviceIdService: DeviceIdService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    this.setDeviceId().then(() => {
      this.socket = this.chatService.connectToSocket(this.deviceId);
      this.getCustomerReps();
      
    });
  }

  reInitialize() {
    this.chats = [];
    this.initScroll = false;
    this.page = 1;
    this.totalPages = 0;
    this.activeRoom = null;
    this.chatToken = null;
    this.chatService.reInitialize();
  }

  public chatLanding: boolean = true;
  @Output() minimizeChatEvent = new EventEmitter<boolean>();

  public async setDeviceId() {
    if (!this.user) {
      this.deviceId = await this.deviceIdService.getDeviceId();
    } else {
      this.deviceId = this.user._id;
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.message += event.emoji.native; // Append the selected emoji to the message
  }

  public toggleChatPage(customerRep: any) {
    this.reInitialize();
    this.chatLanding = !this.chatLanding;
    this.activeCustomerRep = customerRep;
    this.joinChat();
  }

  public minimizeChat() {
    this.minimizeChatEvent.emit(true);
  }

  public async joinChat() {
    this.loading = true;
    const chatTokenAndRoom: any = await this.getChatToken();
    if (chatTokenAndRoom) {
      this.socket.emit('joinRoom', {
        room: chatTokenAndRoom.room,
        token: chatTokenAndRoom.token,
      });
      this.getInitializeChats();
      this.setupScrollEventListener();
    } else {
      alert('Could not authenticate chat');
    }
  }

  setupScrollEventListener() {
    const chatContainer = document.querySelector('.lc-1n5mfq1') as HTMLElement;
    if (!chatContainer) {
      console.error('Chat container not found');
      return;
    }

    // Scroll to bottom by default
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Listen for scroll event to detect upward scroll when content is scrollable
    this.scrollSubscription = fromEvent(chatContainer, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => {
          this.scrollPosition = chatContainer.scrollTop;
          this.threshold = chatContainer.clientHeight * 0.05;
          console.log(this.scrollPosition, this.threshold);
          return this.scrollPosition < this.threshold;
        })
      )
      .subscribe(() => {
        this.loadMoreChats();
      });

    this.scrollSubscription.add(
      fromEvent(chatContainer, 'wheel')
        .pipe(
          filter((event: any) => {
            const scrollPosition = chatContainer.scrollTop;
            const isAtTop = scrollPosition === 0;
            const isScrollingUp = event.deltaY < 0; // Detect upward scroll

            return isScrollingUp && isAtTop; // Only proceed if user is at the top and scrolling up
          })
        )
        .subscribe(() => {
          this.loadMoreChats();
        })
    );
  }

  // Method to load more chats
  loadMoreChats() {
    if (this.page <= this.totalPages && !this.loading) {
      this.loading = true;
      if (!this.initChats) {
        this.getInitializeChats();
      } else {
        this.chatService.getChats(this.activeRoom, this.page, this.pageSize);
      }
    }
  }

  setupDownwardsScrollEventListener() {
    const chatContainer = document.querySelector('.lc-1n5mfq1') as HTMLElement;
    if (!chatContainer) {
      console.error('Chat container not found');
      return;
    }
    this.scrollSubscription = fromEvent(chatContainer, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => {
          const scrollPosition =
            chatContainer.scrollTop + chatContainer.clientHeight;
          const maxScroll = chatContainer.scrollHeight;
          const threshold = chatContainer.clientHeight * 0.05;
          console.log(maxScroll - scrollPosition, threshold);
          return maxScroll - scrollPosition < threshold;
        })
      )
      .subscribe(() => {
        if (this.page <= this.totalPages) {
          this.loading = true;
          if (!this.initChats) {
            this.getInitializeChats();
          } else {
            this.chatService.getChats(
              this.activeRoom,
              this.page,
              this.pageSize
            );
          }
        }
      });
  }

  public getInitializeChats() {
    this.loading = true;
    this.chatService
      .getChats(this.activeRoom, this.page, this.pageSize)
      .subscribe((data: any) => {
        if (data?.status) {
          this.chats = data.messages;
          this.page = data.paginationData.page;
          this.totalPages = data.paginationData.totalPages;
          this.loading = false;
          console.log('Chats ', this.chats);
          if (!this.initChats) {
            this.initChats = true;
          }
          if (this.chats.length == 0) {
            this.chats.push({
              message: `Hello there!, I'm ${this.activeCustomerRep.firstName}, your helpful companion here at Efielounge. How may I assist you today?`,
            });
          }
        }
      });
  }

  public sendMessage() {
    this.chatService
      .sendMessage({
        message: this.message,
        publisher: this.deviceId,
        room: this.activeRoom,
        token: this.chatToken,
      })
      .pipe(take(1))
      .subscribe((status: boolean) => {
        if (status) {
          this.message = '';
        }
      });
  }

  public formatTime() {
    const date: Date = new Date();
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  public formatStrTime(dateStr: string) {
    if (!dateStr) {
      dateStr = new Date().toString();
    }
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  public getChatToken() {
    const chatId: string = `${this.deviceId}-${this.activeCustomerRep._id}`;
    const payload = {
      publisher: this.deviceId,
      subscriber: this.activeCustomerRep._id,
      chatId,
    };

    return new Promise((resolve: any, reject: any) => {
      this.chatService
        .getChatToken(payload)
        .pipe(take(1))
        .subscribe((response: any) => {
          console.log(response);
          if (response.status) {
            this.chatToken = response.data.token;
            this.activeRoom = response.data.room;
            resolve({ token: this.chatToken, room: this.activeRoom });
          }
        });
    });
  }

  public getCustomerReps() {
    this.chatService
      .getCustomerReps()
      .pipe(take(2))
      .subscribe((customerReps: any[]) => {
        this.customerReps = customerReps;
        console.log('Customer reps ==> ', this.customerReps);
      });
  }
}
