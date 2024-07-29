import { Component } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { take } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { TokenService } from '../../services/token.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  providers: [MenuService, AuthService, TokenService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public avatar: string | null = null;
  public user: any = null;
  public menuCategories: any[] = [];
  public cartCount = 0;
  public initialRequest = true;
  public serverUrl = environment.api;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    if (this.user) {
      this.authService.setLoggedIn(true);
      this.avatar = this.user?.avatar;
    } else {
      this.authService.setLoggedIn(false);
    }
    this.setActiveLinkFromUrl();
    const activeLink = this.getActiveLink();
    this.markActiveLink(activeLink);
    this.cartService.getCartCount().subscribe((count) => {
      this.cartCount = count;
    });

    this.menuService
      .fetchCategories()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.menuCategories = response.data;
          }
        },
        (error: any) => {
          alert('Failed to fetch menu categories');
        }
      );
  }

  cartDocker() {
    this.cartService.cartDocker();
  }

  toggleMobileSubMenu() {
    const mobileSubMenu = document.querySelector(`.mobile-sub-menu`) as any;
    const menuCaret = document.querySelector(`.menu-caret`) as any;
    if (mobileSubMenu) {
      mobileSubMenu.classList.toggle('show-sub-menu');
      if (Array.from(mobileSubMenu.classList).includes('show-sub-menu')) {
        if (menuCaret) {
          menuCaret.style.transition = 'transform 0.5s';
          menuCaret.style.transform = 'rotate(90deg)';
        } 
      }else {
        menuCaret.style.transition = 'transform 0.5s';
        menuCaret.style.transform = 'rotate(360deg)';
      }
    }
  }

  markActiveLink(link: string) {
    setTimeout(() => {
      const linkEl = document.querySelector(`#${link}`) as any;
      if (linkEl) {
        linkEl.querySelector('a').style.color = 'orange';
        linkEl
          .querySelector('a')
          .querySelector('svg')
          .querySelector('path').style.fill = 'orange';
      }
    }, 1000);
  }

  shortenEmail(email: string) {
    try {
      const [localPart, domain] = email.split('@');
      if (localPart.length > 4) {
        const shortenedLocalPart = localPart.slice(0, 4) + '...';
        return `${shortenedLocalPart}@${domain}`;
      } else {
        return email;
      }
    } catch (error) {
      return 'Invalid email address';
    }
  }

  setActiveLink($event: any) {
    const link = $event?.target?.closest('li')?.id;
    this.cookieService.set('efielounge-activeLink', link);
  }

  setActiveLinkFromUrl() {
    let link: any;
    const href = document.location.pathname;
    if (href == '/') {
      link = 'home';
    } else if (href == '/about-us') {
      link = 'about';
    } else if (href == '/menu') {
      link = 'menu';
    } else if (href == '/cart') {
      link = 'cart';
    } else if (href == '/orders') {
      link = 'orders';
    } else if (href == '/contact-us') {
      link = 'contact';
    }
    this.markActiveLink(link);
  }

  getActiveLink() {
    return this.cookieService.get('efielounge-activeLink');
  }

  changeAvatar($event: any) {
    const imgInput = document.querySelector(
      '.avatar-input'
    ) as HTMLInputElement;
    imgInput?.click();
  }

  onAvatarChange($event: any) {
    const file = $event?.target?.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('attachments', file);

      this.uploadAvatar(formData)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            this.avatar = response.data.avatar;
          },
          (error: any) => {
            console.error('Upload failed', error);
          }
        );
    }
  }

  uploadAvatar(formData: FormData) {
    return this.authService.uploadAvatar(formData);
  }

  toggleMobileNavMenu() {
    const navMenu = document.querySelector('.responsive-menu') as any;
    if (navMenu) {
      navMenu.classList.toggle('responsive-menu-show');
    }
  }

  logout() {
    this.tokenService.removeTokens();
    this.authService.logout();
  }
}
