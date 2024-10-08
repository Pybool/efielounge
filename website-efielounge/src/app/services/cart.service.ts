import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  BehaviorSubject,
  catchError,
  Observable,
  ReplaySubject,
  take,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public showCartModal: boolean = false;
  public cartCount = 0;
  public initialRequest = true;
  public extras: string[] = [];
  public variants: string[] = [];
  public orderTotal: number = 0.0;
  public units = 1;
  public cartItems: any = [];
  public subTotal: number = 0.0;
  public isCartDockerOpen = false;
  private cartSubject = new ReplaySubject<any>(1);

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

  private cartCountSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  private cartModalAndSelectedMenuSubject: BehaviorSubject<number> =
    new BehaviorSubject<any>({});

  private cartItemRemovedSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>({});
  public cartItemsSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    this.getCartCounting();
  }

  cartItemRemoved() {
    return this.cartItemRemovedSubject.asObservable();
  }

  calculatePricePerMeal(
    cartItem: any,
    basePrice: number,
    extras: any[],
    variants: any[],
    units = 1
  ) {
    const extrasTotalPrice = extras.reduce(
      (acc, extra: any) => acc + extra.price,
      0
    );
    const getVariantPrice = () => {
      return cartItem.menu.variants.find((variant: any) => {
        if (variant.name === variants[0]) {
          return variant;
        }
      });
    };
    if (variants.length > 0) {
      cartItem.total =
        (basePrice + Number(getVariantPrice().price) + extrasTotalPrice) *
        cartItem?.units;
    } else {
      cartItem.total = (basePrice + extrasTotalPrice) * cartItem?.units;
    }

    return this.calculateSubTotal();
  }

  calculateSubTotal() {
    const subTotal = this.cartItems.reduce(
      (acc: any, cartItem: any) => acc + cartItem.total,
      0
    );
    this.subTotal = subTotal;
    this.cartItemsSubject.next({
      cartItems: this.cartItems,
      subTotal: this.subTotal,
    });
    return this.subTotal;
  }

  resetCart() {
    this.cartCountSubject.next(0);
    this.cartItemsSubject.next({
      cartItems: [],
      subTotal: 0.0,
    });
    this.cartItems = [];
    this.subTotal = 0.00
  }

  setCartItems(cartItem: any) {
    this.handleAddedCartItem(cartItem);
    this.cartItemsSubject.next({
      cartItems: this.cartItems,
      subTotal: this.subTotal,
    });
  }

  recalculate(closeModal: boolean= true) {
    for (let cartItem of this.cartItems) {
      this.calculatePricePerMeal(
        cartItem,
        cartItem.menu.price,
        cartItem.customMenuItems,
        cartItem.variants,
        cartItem.units
      );
      for (let extra of cartItem.customMenuItems) {
        extra.isFinalSelect = true;
      }
    }
    this.cartItemsSubject.next({
      cartItems: this.cartItems,
      subTotal: this.subTotal,
    });
  }

  getCartItems() {
    const user = this.authService.retrieveUser();
    if (user) {
      this.getCart()
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.cartItems = response.data;
              this.recalculate();
            } else {
            }
          },
          (error: any) => {}
        );
    }
    return this.cartItemsSubject.asObservable();
  }

  private getObjectById(array: any, id: string | undefined) {
    return array.find((item: { _id: string }) => item._id === id);
  }

  handleAddedCartItem(value: any) {
    const data: any = {};

    try {
      data.customMenuItems = value.data.customMenuItems;
      data.variants = value.data.variants;
      data.menu = value.data.menu;
      data.units = value.data.units;
      data._id = value.data._id;

      this.calculatePricePerMeal(
        data,
        data.menu.price,
        data.customMenuItems,
        data.variants,
        data.units
      );
      for (let extra of data.customMenuItems) {
        extra.isFinalSelect = true;
      }

      this.cartItems.unshift(data);
      this.handleBooleanEvent(false);
      this.calculateSubTotal();
    } catch {}
  }

  deleteObjectById(id:string){
    if (this.cartItems) {
      const index = this.cartItems.findIndex(
        (obj: { _id: string }) => obj._id === id
      );
      if (index !== -1) {
        this.cartItems.splice(index, 1);
        // document.location.reload()
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  setCartCount(count: number, cartItemId: string | null = null): void {
    if (cartItemId) {
      this.cartItemRemovedSubject.next(cartItemId);
    }
    if (count < 0) {
      const currentCount = this.cartCountSubject.value;
      count = currentCount + count;
      this.calculateSubTotal();
    }
    if(count == 0 ){
      this.resetCart()
    }
    this.cartCountSubject.next(count);
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  getCartCounting() {
    const user = this.authService.retrieveUser();
    if (user) {
      this.getCart()
        .pipe(take(1))
        .subscribe((response: any) => {
          if (response.status) {
            this.cartCountSubject.next(response.data.length);
          }
        });
    }
    this.cartCountSubject.next(0);
  }

  setCartModalAndSelectedMenu(data: any): void {
    this.cartModalAndSelectedMenuSubject.next(data);
  }

  getCartModalAndSelectedMenu(): Observable<any> {
    return this.cartModalAndSelectedMenuSubject.asObservable();
  }

  getCheckOutItem(checkOutId: string) {
    return this.http.get(
      `${environment.api}/api/v1/cart/get-checkout?checkOutId=${checkOutId}`
    );
  }

  addToCart(payload: {
    menu: string;
    units: number;
    customMenuItems: any[];
    variants: string[];
  }): Observable<any> {
    return this.http
      .post(`${environment.api}/api/v1/cart/add-to-cart`, payload)
      .pipe(
        tap((res: any) => {
          const currentCount = this.cartCountSubject.value;
          if (!res?.isMerged) {
            this.cartCountSubject.next(currentCount + 1);
          }
        }),
        catchError((error) => {
          console.error('Add to cart failed', error);
          throw error;
        })
      );
  }

  getCart(checkOutId?: string) {
    return this.http.get(
      `${environment.api}/api/v1/cart/get-cart?checkOutId=${checkOutId}`
    );
  }

  removeFromCart(payload: { cartItemId: string }) {
    return this.http.patch(
      `${environment.api}/api/v1/cart/remove-from-cart`,
      payload
    );
  }

  dumpCart() {
    this.http
      .delete(`${environment.api}/api/v1/cart/dump-cart`, {})
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.resetCart();
          } else {
            alert('Could not dump your cart at the moment');
          }
        },
        (error: any) => {
          alert('Could not dump your cart at the moment');
        }
      );
  }

  updateCartItemsAndCheckOut(payload: any, checkOutId: string | null = null) {
    let url = `${environment.api}/api/v1/cart/checkout`;
    if (checkOutId) {
      url = `${environment.api}/api/v1/cart/checkout?checkOutId=${checkOutId}`;
    }
    return this.http.put(url, payload);
  }

  saveTransaction(reference: string, checkOutId: string, transaction: any) {
    return this.http.post(
      `${environment.api}/api/v1/transactions/save-transaction`,
      { reference, checkOutId, transaction }
    );
  }

  cartDocker(close = false) {
    const path = window.location.pathname;
    const exclusivePathNames = ['/menu', '/search-menu'];
    if (exclusivePathNames.includes(path)) {
      const inPagesCartWidget = document.querySelector(
        'app-cart-docked'
      ) as any;
      if (inPagesCartWidget) {
        inPagesCartWidget.scrollIntoView();
      }
      return null;
    }
    
    const dockWidget = document.getElementById('dock-widget') as any;
    if(!close){
      dockWidget.classList.toggle('dock-visible');
    }else{
      dockWidget.classList.remove('dock-visible');
    }
    const body = document.querySelector('body') as any;
    const cartOverlay = document.querySelector('.cart-overlay') as any;

    if (close) {
      body.style.overflow = 'auto';
      body.style.position = 'unset';
      dockWidget.classList.remove('dock-visible');
      if (cartOverlay) {
        cartOverlay.style.display = 'none';
        this.isCartDockerOpen = false;
      }
      return null;
    }else{
      if (!Array.from(dockWidget.classList).includes('dock-visible')) {
        body.style.overflow = 'auto';
        body.style.position = 'unset';
        if (cartOverlay) {
          cartOverlay.style.display = 'none';
          this.isCartDockerOpen = false;
        }
      } else {
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        if (cartOverlay) {
          cartOverlay.style.display = 'block';
          this.isCartDockerOpen = true;
        }
      }
    }

    
    return null;
  }

  getShowCartModalStatus() {
    return this.isCartDockerOpen;
  }

  toggleAddToCartModal() {
    if (this.showCartModal == false) {
      this.showCartModal = true;
    }
  }

  addToCartItems(menu: any, units: number, extras: any[], variants: string[]) {
    this.units = units;
    this.selectedMenu = menu;
    this.extras = extras;
    this.variants = variants;
    this.addToCart({
      menu: this.selectedMenu._id,
      units: this.units,
      customMenuItems: this.extras,
      variants: this.variants,
    })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.setCartItems(response);
          this.cartSubject.next(response); // Emit the response
        },
        (error: any) => {
          console.log('error ', error, Object.keys(error));
          this.cartSubject.error(error); // Emit the error
        }
      );
    // Return the subject as an observable for external subscriptions
    return this.cartSubject.asObservable();
  }

  handleBooleanEvent(value: boolean) {
    this.showCartModal = value;

    if (!value) {
      this.setCartModalAndSelectedMenu({
        showCartModal: value,
        selectedMenu: {},
      });
      const body = document.querySelector('body') as any;
      body.style.overflow = 'auto';
      body.style.position = 'unset';
    }
  }

  orderNow(menu: any) {
    if (this.authService.retrieveUser()) {
      this.toggleAddToCartModal();
      this.selectedMenu = {
        _id: menu._id,
        name: menu.name,
        price: menu.price.toFixed(2).toLocaleString(),
        image: menu.attachments[0],
        description: menu.description,
        extras: menu.menuItems,
        variants: menu.variants,
      };
      const body = document.querySelector('body') as any;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';

      this.setCartModalAndSelectedMenu({
        showCartModal: this.showCartModal,
        selectedMenu: this.selectedMenu,
      });
    } else {
      const pathname = document.location.pathname;
      // if (pathname !== '/') {
        const timestamp = Date.now();
        const currentUrl = `${window.location.href}&idn=${timestamp}&id=${
          menu?._id || ''
        }`;
        const encodedUrl = encodeURIComponent(currentUrl);
        window.location.href = `/login?next=${encodedUrl}`;
      // } 
      // else {
      //   window.location.href = `/login`;
      // }
    }
  }
}
