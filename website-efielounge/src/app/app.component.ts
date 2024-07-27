import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { CartDockedComponent } from './components/cart-docked/cart-docked.component';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HomeService } from './services/home.service';
import { environment } from '../environments/environment';
import { RingingBellComponent } from './components/ringing-bell/ringing-bell.component';

interface Ipromotion {
  _id?: string;
  description?: string;
  attachments?: { type: string; url: string }[];
  isActive?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CartDockedComponent, CommonModule, RingingBellComponent],
  providers: [HttpClientModule, AuthService, CartService, HomeService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'efielounge';
  public showCartModal: boolean = false;
  public cartCount = 0;
  public initialRequest = true;
  public user = null;
  public createdAt?: Date;
  public serverUrl:string = environment.api;
  public promotions: Ipromotion[] = [];
  public promotionIsScreenEligible: boolean = false;
  public homePageData:any = {}

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
    private authService: AuthService,
    private cartService: CartService,
    private homeService: HomeService
  ) {
    this.homeService.getHomeData()
    this.homeService.getHomeDataObs().subscribe((homePageData:any)=>{
      this.homePageData = homePageData;
      this.promotions = this.homePageData.promotions;
    })
  
    const status = this.checkIfPromotionsIsScreenEligible();
    if (status) {
      setTimeout(() => {
        this.toggleTransferModal();
      }, 3000);
    }
  }

  ngOnInit() {
    const user = this.authService.retrieveUser();

    if (user) {
      this.user = user;
      this.authService.setLoggedIn(true);
    } else {
      this.authService.setLoggedIn(false);
      // this.authService.navigateToUrl("/login")
    }
    this.cartService.getCartCount().subscribe((count) => {
      this.cartCount = count;
    });

    this.cartService.getCartModalAndSelectedMenu().subscribe((data: any) => {
      this.showCartModal = data.showCartModal;
      this.selectedMenu = data.selectedMenu;
    });
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
    }, 5000);
  }

  acceptCookies() {
    window.localStorage.setItem('eflc-ack', 'seen');
    const banner = document.querySelector('.base-cookie-banner') as any;
    if (banner) {
      banner.style.display = 'none';
    }
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
