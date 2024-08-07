import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddCartModalComponent } from '../add-cart-modal/add-cart-modal.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { RemoveFromCartComponent } from '../remove-from-cart/remove-from-cart.component';
import { EmptyCartComponent } from '../empty-cart/empty-cart.component';

@Component({
  selector: 'app-cart-docked',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddCartModalComponent,
    RemoveFromCartComponent,
    EmptyCartComponent,
  ],
  providers: [AuthService],

  templateUrl: './cart-docked.component.html',
  styleUrl: './cart-docked.component.scss',
})
export class CartDockedComponent implements OnDestroy {
  public serverUrl: string = environment.api;
  public extras: string[] = [];
  @Input() showCartModal = false;
  @Input() selectedMenu: any = {
    _id: '',
    name: '',
    price: 0.0,
    image: '',
    description: '',
    extras: [],
    variants: [],
  };
  public lastExtraId: string = '';
  public lastEntropy: string = '';
  public orderTotal: number = 0.0;
  public units = 1;
  public cartItems: any[] = [];
  public extrasObj = [];
  public showCartMessage = '';
  public deliveryFee = 0.0;
  public subTotal = 0;
  @Output() booleanEvent = new EventEmitter<boolean>();
  public removeFromCart: boolean = false;
  public removal: { name: string; _id: string } = { name: '', _id: '' };
  public checkoutId: string = '';
  public showCheckOutSpinner: boolean = false;
  public cartItems$: any;
  public cartItemRemoved$: any;
  public lockedExtras: any = {};

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.retrieveUser();
    if (user) {
      this.cartItems$ = this.cartService
        .getCartItems()
        .subscribe((response: any) => {
          this.cartItems = response.cartItems;
          this.subTotal = response.subTotal;
        });
      this.cartItemRemoved$ = this.cartService
        .cartItemRemoved()
        .subscribe((cartItemId: string) => {
          this.deleteObjectById(cartItemId);
          this.subTotal = 0.0;
          this.deliveryFee = 0.0;
        });
    }
  }

  handleBooleanEvent(value: boolean) {
    this.showCartModal = value;
    this.booleanEvent.emit(value);
  }

  handleAddedCartItem(value: any) {
    const data: any = {};

    try {
      data.customMenuItems = value.data.customMenuItems;
      data.menu = value.data.menu;
      data.units = value.data.units;
      data._id = value.data._id;
      this.calculatePricePerMeal(
        data,
        data.menu.price,
        data.customMenuItems,
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

  private getObjectById(array: any, id: string | undefined) {
    return array.find((item: { _id: string }) => item._id === id);
  }

  toggleDocker(){
    this.cartService.cartDocker()
  }

  private generateRandomId(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getModifiedExtras(cartItem: any): any {
    for (let extra of cartItem.menu.menuItems) {
      if (!this.getObjectById(cartItem.customMenuItems, extra._id)) {
        cartItem.customMenuItems.push(extra);
      }
    }
    return cartItem.customMenuItems;
  }

  getModifiedExtraId(id: string, index: number): string {
    const key = id + `-00${index}`;
    if (!this.lockedExtras[key]) {
      let entropy = this.lastEntropy;
      if (id !== this.lastExtraId) {
        entropy = this.generateRandomId(10);
      }
      this.lastEntropy = entropy;
      this.lastExtraId = id;
      this.lockedExtras[key] = entropy;
      return `${id}-${entropy}`;
    }
    return `${id}-${this.lockedExtras[key]}`;
  }

  calculatePricePerMeal(
    cartItem: any,
    basePrice: number,
    extras: any[],
    units = 1
  ) {
    const extrasTotalPrice = extras.reduce(
      (acc, extra: any) => acc + extra.price,
      0
    );
    cartItem.total = (basePrice + extrasTotalPrice) * cartItem?.units;
    this.calculateSubTotal();
  }

  calculateSubTotal() {
    const subTotal = this.cartItems.reduce(
      (acc, cartItem: any) => acc + cartItem.total,
      0
    );
    this.subTotal = subTotal;
  }

  handleClick($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  addQty(cartItem: any) {
    if (cartItem.units < 5) {
      cartItem.units += 1;
      this.calculatePricePerMeal(
        cartItem,
        cartItem.menu.price,
        cartItem.customMenuItems,
        cartItem.units
      );
    } else {
      alert('You can only place a maximum of 5 orders for the same menu');
    }
  }

  subQty(cartItem: any) {
    if (cartItem.units > 1) {
      cartItem.units -= 1;
      this.calculatePricePerMeal(
        cartItem,
        cartItem.menu.price,
        cartItem.customMenuItems,
        cartItem.units
      );
    }
  }

  isChosenExtra($event: any, cartItem: any, extra: any) {
    extra.isFinalSelect = !extra.isFinalSelect;
    if (!extra.isFinalSelect) {
      const amountToDeduct = cartItem.units * extra.price;
      cartItem.total = cartItem.total - amountToDeduct;
    } else {
      const amountToAdd = cartItem.units * extra.price;
      cartItem.total = cartItem.total + amountToAdd;
    }
    this.calculateSubTotal();
  }

  toggleRemoveFromCartModal(name: string, _id: string) {
    this.removal = { name, _id };
    const confirmationModal = document.querySelector(
      '#confirmationModal'
    ) as any;
    if (confirmationModal) {
      if (confirmationModal.style.display == 'block') {
        confirmationModal.style.display = 'none';
      } else {
        confirmationModal.style.display = 'block';
      }
    }
  }

  deleteObjectById(id: string) {
    if (this.cartItems) {
      const index = this.cartItems.findIndex(
        (obj: { _id: string }) => obj._id === id
      );

      if (index !== -1) {
        this.cartItems.splice(index, 1); // Remove the object at the found index
        return true; // Indicate successful deletion
      } else {
        return false; // Indicate object not found
      }
    }
    return false;
  }

  handleConfirmEvent() {
    this.deleteObjectById(this.removal._id);
    this.cartService.setCartCount(-1);
  }

  checkOut() {
    this.showCheckOutSpinner = true;
    this.cartService
      .updateCartItemsAndCheckOut({ cartItems: this.cartItems })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.showCheckOutSpinner = false;
          if (response.status) {
            this.checkoutId = response.data.checkOutId;
            this.router.navigateByUrl(`/checkout/${this.checkoutId}`);
          } else {
            alert('Unable to checkout at this moment');
          }
        },
        (error: any) => {
          this.showCheckOutSpinner = false;
          alert('Unable to checkout at this moment');
        }
      );
  }

  dumpCart() {
    if (this.cartItems.length > 0) {
      const confirmDump = confirm('Are you sure you want to dump cart?');
      if (confirmDump) {
        this.cartService.dumpCart();
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    this.cartItems$?.unsubscribe();
    this.cartItemRemoved$?.unsubscribe();
  }
}
