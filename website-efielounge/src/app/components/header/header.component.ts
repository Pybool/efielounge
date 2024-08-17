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
import { ClickOutsideDirective } from '../../directives/country-select.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountrySelectComponent } from '../country-select/country-select.component';
import Swal from 'sweetalert2';
import { AddressModalComponent } from '../address-modal/address-modal.component';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    ClickOutsideDirective,
    FormsModule,
    ReactiveFormsModule,
    CountrySelectComponent,
    AddressModalComponent,
  ],
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
  public isProfileDockerOpen: boolean = false;
  public isEditing: boolean = false;
  public profile: any = {};
  public addresses: any[] = [];
  public addressId: string = '';
  public showCartModal = false;
  public disable: boolean = true;
  public phoneEdited: boolean = false;
  public fullName: string | null = null;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private cartService: CartService,
    private addressService: AddressService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    if (this.user) {
      this.profile = JSON.parse(JSON.stringify(this.user));
      
      this.fullName = this.getFullName()
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

  getFullName(){
    if(this.user?.firstName?.trim() !== "" || this.user?.lastName?.trim() !== ""){
      console.log(`${this.user?.firstName?.trim()} ${this.user?.lastName?.trim()}`)
      return `${this.user?.firstName?.trim()} ${this.user?.lastName?.trim()}`
    }else{
      return null
    }
  }

  cartDocker() {
    this.cartService.cartDocker();
  }

  toggleProfile(fromOutSide: number = 0) {
    let profile = document.querySelector('.profile');
    let menu = document.querySelector('.menu') as any;
    if (fromOutSide == 0) {
      menu.classList.add('active');
      
    } else {
      menu.classList.remove('active');
    }
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
      } else {
        menuCaret.style.transition = 'transform 0.5s';
        menuCaret.style.transform = 'rotate(360deg)';
      }
    }
  }

  markActiveLink(link: string) {
    setTimeout(() => {
      const linkEl = document.querySelector(`#${link}`) as any;
      if (linkEl) {
        linkEl.querySelector('a').style.color = 'orangered';
        linkEl
          .querySelector('a')
          .querySelector('svg')
          .querySelector('path').style.fill = 'orangered';
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
      return null;
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

  profileDocker(close = false) {
    const dockWidget = document.getElementById('profile-dock-widget') as any;
    dockWidget.classList.toggle('dock-visible');
    const body = document.querySelector('body') as any;
    const cartOverlay = document.querySelector('.profile-overlay') as any;
    if(!this.isProfileDockerOpen){
      this.fetchAddresses();
    }

    if (close) {
      body.style.overflow = 'auto';
      body.style.position = 'unset';
      dockWidget.classList.remove('dock-visible');
      if (cartOverlay) {
        cartOverlay.style.display = 'none';
        this.isProfileDockerOpen = false;
      }
      return null;
    }

    if (!Array.from(dockWidget.classList).includes('dock-visible')) {
      body.style.overflow = 'auto';
      body.style.position = 'unset';
      if (cartOverlay) {
        cartOverlay.style.display = 'none';
        this.isProfileDockerOpen = false;
      }
    } else {
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      if (cartOverlay) {
        cartOverlay.style.display = 'block';
        this.isProfileDockerOpen = true;
      }
    }
    return null;
  }

  handleCountrySelected(value: {
    name: string;
    dial_code: string;
    code: string;
  }) {
    this.profile.dialCode = value.dial_code;
    this.profile.countryCode = value.code;
    this.profile.country = value.name;
    this.phoneEdited = true;
    this.isValidPhone();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;

    const formGroups = document.querySelectorAll('.form-group') as any;
    for (let formGroup of formGroups) {
      Array.from(formGroup?.children)?.forEach((element: any) => {
        if (!this.isEditing) {
          if (element.tagName !== 'IMG') element?.classList.add('not-editing');
        } else {
          element?.classList.remove('not-editing');
        }
      });
      formGroup?.classList.add('not-editing');
    }
  }

  updateProfile() {
    this.authService
      .updateProfile(this.profile)
      .pipe(take(1))
      .subscribe((response: any) => {
        if(response.status){
          Swal.fire(response?.message);
          this.user = response.data;
          this.authService.storeUser(this.user)
          this.fullName = this.getFullName()
          this.toggleEdit();
        }else{
          this.profile = JSON.parse(JSON.stringify(this.user));
          this.toggleEdit()
          Swal.fire(response?.message);
        }
      },((error:any)=>{
        alert("Profile update failed")
      }));
  }

  fetchAddresses() {
    this.addressService.getAddressesObs().subscribe((addresses:any)=>{
      this.addresses = addresses
    })
  }

  setDefaultAddress(address: any) {
    this.addressId = address._id;
    this.addressService.setDefaultAddress(address)
  }

  removeAddress(addressId: string) {
    const confirmation = confirm(
      'Are you sure you want to delete this address?'
    );
    if (confirmation) {
      this.addressService.removeAddress( addressId )
    }
  }
  handleBooleanEvent(value: boolean) {
    this.showCartModal = value;
  }

  handleNewAddressEvent(value: boolean) {
    this.addresses.unshift(value);
    this.showCartModal = false;
  }

  isValidPhone($event: any = null) {
    console.log(
      `${this.profile.dialCode}${this.profile.phone}`,
      this.profile.countryCode
    );
    const isValidPhone = this.authService.validatePhoneNumber(
      `${this.profile.dialCode}${this.profile.phone}`,
      this.profile.countryCode
    );
    this.disable = !isValidPhone;
  }

  phoneEdit() {
    this.phoneEdited = true;
    this.isValidPhone();
  }

  logout() {
    this.tokenService.removeTokens();
    this.authService.logout();
  }
}
