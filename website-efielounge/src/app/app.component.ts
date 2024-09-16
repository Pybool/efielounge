import { HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { CartDockedComponent } from './components/cart-docked/cart-docked.component';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HomeService } from './services/home.service';
import { environment } from '../environments/environment';
import { RingingBellComponent } from './components/ringing-bell/ringing-bell.component';
import { AddressService } from './services/address.service';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { ChatsComponent } from './components/chats/chats.component';
import { ChatService } from './services/chat.service';
import { DeviceIdService } from './services/fingerprint.service';

interface Ipromotion {
  _id?: string;
  description?: string;
  attachments?: { type: string; url: string }[];
  isActive?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    CartDockedComponent,
    CommonModule,
    RingingBellComponent,
    TermsComponent,
    PrivacyPolicyComponent,
    ChatsComponent,
  ],
  providers: [
    HttpClientModule,
    AuthService,
    CartService,
    HomeService,
    AddressService,
    ChatService,
    DeviceIdService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'efielounge';
  public showCartModal: boolean = false;
  public cartCount = 0;
  public initialRequest = true;
  public user: any = null;
  public createdAt?: Date;
  public serverUrl: string = environment.api;
  public promotions: Ipromotion[] = [];
  public promotionIsScreenEligible: boolean = false;
  public homePageData: any = {};
  @ViewChild('scrollablePromotions') scrollablePromotions!: ElementRef;
  private scrollTimeout: any;
  public mId: any = null;
  public showTerms = false;
  public showPrivacyPolicy = false;
  public forceShowterms = false;
  public showChatWidget: boolean = false;
  public selectedMenu:
    | {
        _id: string;
        name?: string;
        price?: string;
        image: string;
        description: string;
        extras?: any[];
      }
    | any = {};

  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private cartService: CartService,
    private homeService: HomeService,
    private route: ActivatedRoute
  ) {
    this.homeService.getHomeData();
    this.homeService.getHomeDataObs().subscribe((homePageData: any) => {
      this.homePageData = homePageData;
      this.promotions = this.homePageData.promotions || [];
    });

    const status = this.checkIfPromotionsIsScreenEligible();
    if (status) {
      setTimeout(() => {
        this.toggleTransferModal();
      }, 3000);
    }
  }

  ngOnInit() {
    const user = this.authService.retrieveUser();
    this.route.queryParams.subscribe((params: any) => {
      this.mId = params?.['id'];
    });

    if (user) {
      this.user = user;
      this.authService.setLoggedIn(true);
      this.cartService.getCartCount().subscribe((count) => {
        this.cartCount = count;
      });

      this.cartService.getCartModalAndSelectedMenu().subscribe((data: any) => {
        this.showCartModal = data.showCartModal;
        this.selectedMenu = data.selectedMenu;
      });
      setTimeout(() => {
        if (!this.user.acceptedTerms) {
          if (
            window.localStorage.getItem(`efl-t-${this.user?._id || 'anon'}`) ==
            'seen'
          ) {
            this.authService
              .acceptTerms(this.user?._id)
              .pipe(take(1))
              .subscribe((response: any) => {
                if (response.status) {
                  this.authService.storeUser(response.data);
                }
              });
          } else {
            this.showTerms = true;
            this.forceShowterms = true;
          }
        } else {
          this.showTerms = false;
          this.forceShowterms = false;
        }
      }, 6000);
    } else {
      this.authService.setLoggedIn(false);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const cookiesAccepted = window.localStorage.getItem('eflc-ack');
      if (cookiesAccepted !== 'seen') {
        const banner = document.querySelector('.base-cookie-banner') as any;
        if (banner) {
          banner.style.display = 'flex';
        }
      }
      try {
        this.scrollablePromotions.nativeElement.addEventListener(
          'scroll',
          () => {
            clearTimeout(this.scrollTimeout);
            this.resetScrollTimeout();
          }
        );

        this.resetScrollTimeout();
      } catch {}
    }, 5000);
    if (this.mId) {
      this.scrollToElement();
    }
  }

  toggleChatWidget() {
    // this.showChatWidget = !this.showChatWidget;
    const chatWidget: any = document.getElementById('chat-dock-widget');
    if (
      (chatWidget && chatWidget.style.display === '') ||
      chatWidget.style.display === 'none'
    ) {
      chatWidget.style.display = 'flex';
      setTimeout(()=>{
        chatWidget.style.opacity = '1';
      },100)
      
    } else {
      chatWidget.style.opacity = '0';
      setTimeout(()=>{
        chatWidget.style.display = 'none';
      },500)
      
    }
  }

  scrollToElement() {
    const item: any = document.getElementById(this.mId);
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  resetScrollTimeout() {
    this.scrollTimeout = setTimeout(() => {
      this.slowScroll();
    }, 6000);
  }

  slowScroll() {
    const scrollablePromotions = this.scrollablePromotions.nativeElement;
    const scrollStep = 1; // Adjust this value to control scroll speed
    const scrollInterval = 50; // Adjust this value to control scroll speed

    const scrollDown = () => {
      if (
        scrollablePromotions.scrollTop <
        scrollablePromotions.scrollHeight - scrollablePromotions.clientHeight
      ) {
        scrollablePromotions.scrollTop += scrollStep;
        setTimeout(scrollDown, scrollInterval);
      } else {
        setTimeout(scrollUp, 1000); // Pause at the bottom before scrolling up
      }
    };

    const scrollUp = () => {
      if (scrollablePromotions.scrollTop > 0) {
        scrollablePromotions.scrollTop -= scrollStep;
        setTimeout(scrollUp, scrollInterval);
      } else {
        this.resetScrollTimeout();
      }
    };

    this.ngZone.runOutsideAngular(() => {
      scrollDown();
    });
  }

  closeCookies() {
    const banner = document.querySelector('.base-cookie-banner') as any;
    if (banner) {
      banner.style.display = 'none';
    }
  }

  acceptCookies() {
    window.localStorage.setItem('eflc-ack', 'seen');
    this.closeCookies();
  }

  cartDocker() {
    this.cartService.cartDocker();
  }

  toggleAddToCartModal() {
    this.cartService.toggleAddToCartModal();
  }

  handleBooleanEvent(value: boolean) {
    this.cartService.handleBooleanEvent(value);
  }

  handleTermsBooleanEvent(value: boolean) {
    this.showTerms = value;
    this.forceShowterms = value;
  }

  handlePrivacyBooleanEvent(value: boolean) {
    this.showPrivacyPolicy = value;
  }

  orderNow(menu: any) {
    this.cartService.orderNow(menu);
  }

  private checkIfPromotionsIsScreenEligible() {
    let lastPromotionMeta = window.localStorage.getItem('eflp-meta') as any;
    lastPromotionMeta = JSON.parse(lastPromotionMeta);
    if (!lastPromotionMeta) {
      this.promotionIsScreenEligible = true;
      return true;
    }

    for (let promotion of this.promotions) {
      let _promotion = promotion as any;
      if (promotion) {
        if (lastPromotionMeta.seenAt < _promotion!.createdAt) {
          this.promotionIsScreenEligible = true;
          return true;
        }
      }
    }
    return false;
  }

  public markPromotionAsSeen() {
    window.localStorage.setItem(
      'eflp-meta',
      JSON.stringify({ seenAt: new Date() })
    );
    this.toggleTransferModal();
  }

  toggleTransferModal() {
    const transferModal = document.querySelector('#promotions-modal') as any;
    const body = document.querySelector('body') as any;
    if (transferModal) {
      if (transferModal.style.display == 'block') {
        transferModal.style.display = 'none';
        body.style.overflow = 'auto';
        body.style.position = 'unset';
      } else {
        transferModal.style.display = 'block';
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
      }
    }
  }
}
