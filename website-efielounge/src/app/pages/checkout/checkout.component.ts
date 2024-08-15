import { Component, OnDestroy } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { take } from 'rxjs';
import { RemoveFromCartComponent } from '../../components/remove-from-cart/remove-from-cart.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectBankTransferModalComponent } from '../../components/direct-bank-transfer-modal/direct-bank-transfer-modal.component';
import { PaystackService } from '../../services/paystack.service';
import { AuthService } from '../../services/auth.service';
import { AddressModalComponent } from '../../components/address-modal/address-modal.component';
import Swal from 'sweetalert2';
import { AddressListComponent } from '../../components/address-list/address-list.component';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    CarouselComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RemoveFromCartComponent,
    DirectBankTransferModalComponent,
    AddressModalComponent,
    AddressListComponent,
  ],
  providers: [PaystackService, AuthService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnDestroy {
  public units: number = 1;
  public menus: any[] = [];
  public serverUrl: string = environment.api;
  public checkOutItems: any[] = [];
  public removeFromCart: boolean = false;
  public removal: { name: string; _id: string } = { name: '', _id: '' };
  public activatedRoute$: any;
  public checkOutId: any = null;
  public deliveryCost = 30.0;
  public payment: { ref: string; amount: number | string } = {
    ref: this.checkOutId,
    amount: 0.0,
  };
  public showCartModal = false;
  public showAddressesModal = false;
  public paymentMethod: string = 'card';
  public user: any;
  public addresses: any = [];
  public subTotal = 0.0;
  public cartItems$: any;
  public addressId: string = '';
  public dockStatus = true;
  Math = Math;

  constructor(
    public cartService: CartService,
    private route: ActivatedRoute,
    private paystackService: PaystackService,
    private authService: AuthService,
    private router: Router,
    private addressService: AddressService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    if (!this.user) {
      this.router.navigateByUrl('/login');
    }

    this.activatedRoute$ = this.route.paramMap.subscribe((params) => {
      this.checkOutId = params.get('checkOutId') as string;
      this.cartItems$ = this.cartService.getCartItems().subscribe(
        (response: any) => {
          // this.cartService.cartDocker(this.dockStatus);
          this.dockStatus = false;
          this.checkOutItems = response.cartItems || [];
          this.subTotal = response.subTotal;
        },
        (error: any) => {}
      );
    });

    this.addressService.getAddressesObs().subscribe((addresses:any)=>{
      this.addresses = addresses
    })

  }

  handleBooleanEvent(value: boolean) {
    this.showCartModal = value;
  }

  handleAddressListCloseEvent(value: boolean) {
    this.showAddressesModal = value;
  }

  handleNewAddressEvent(value: boolean) {
    this.addresses.unshift(value);
    if (!this.activatePayment()) {
      this.setDefaultAddress(value);
    }
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
      document.querySelector('html')?.scrollIntoView();
    }, 100);
  }

  initiatePayment(amount: number, email: string, checkOutId: string) {
    return new Promise((resolve, reject) => {
      this.paystackService.initiatePayment(amount, email, (response) => {
        if (response.status === 'success') {
          resolve(this.verifyTransaction(response.reference, this.checkOutId));
        } else {
          reject(this.verifyTransaction(response.reference, this.checkOutId));
        }
      });
    });
  }

  verifyTransaction(reference: string, checkOutId: string) {
    this.paystackService.verifyTransaction(reference, (paymentResponse) => {
      setTimeout(() => {
        if (paymentResponse.data.status == 'success') {
          this.cartService
            .saveTransaction(reference, checkOutId, paymentResponse)
            .subscribe((response: any) => {
              if (response.status) {
                this.cartService.resetCart();
                this.router.navigateByUrl('/orders');
              } else {
                alert(response.message);
              }
            });
        }
      }, 1000);
    });
  }

  

  activatePayment() {
    let defaultSelected = false;
    for (let _address of this.addresses) {
      if (_address.isDefault == true) {
        this.addressId = _address._id;
        defaultSelected = true;
        break;
      }
    }
    return defaultSelected;
  }

  toggleRemoveFromCartModal(name: string, _id: string) {
    this.removal.name = name;
    this.removal._id = _id;
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

  deleteObjectById(arr: any, id: string) {
    const index = arr.findIndex((obj: { _id: string }) => obj._id === id);

    if (index !== -1) {
      arr.splice(index, 1); // Remove the object at the found index
      return true;
    } else {
      return false;
    }
  }

  setDefaultAddress(address: any) {
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

  handleConfirmEvent() {
    this.deleteObjectById(this.checkOutItems, this.removal._id);
    this.cartService.setCartCount(-1, this.removal._id);
  }

  addQty(checkOutItem: any) {
    if (checkOutItem.units < 50) {
      checkOutItem.units += 1;
    } else {
      alert('You can only place a maximum of 50 orders for the same menu');
    }
  }

  subQty(checkOutItem: any) {
    if (checkOutItem.units > 1) {
      checkOutItem.units -= 1;
    }
  }

  checkOut() {
    if (!this.activatePayment()) {
      if (this.addresses.length == 0) {
        return this.handleBooleanEvent(true);
      } else {
        this.showAddressesModal = true;
        return setTimeout(()=>{
          this.toggleAddressesModal();
        },500)
      }
    }

    this.cartService
      .updateCartItemsAndCheckOut(
        {
          cartItems: this.checkOutItems,
          amount: this.subTotal + this.deliveryCost,
          addressId: this.addressId,
        },
        this.checkOutId
      )
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.payment = {
              ref: this.checkOutId,
              amount: this.subTotal + this.deliveryCost,
            };
            this.checkOutId = response.data.checkOutId;
            if (this.paymentMethod == 'transfer') {
              this.toggleTransferModal();
            } else {
              this.initiatePayment(
                Math.ceil(Number(this.payment.amount)),
                this.user.email || `customer${this.user.phone}@efielounge.com`,
                this.checkOutId
              );
            }
          } else {
            alert('Unable to checkout at this moment');
          }
        },
        (error: any) => {
          alert('Unable to checkout at this moment');
        }
      );
  }

  getCartItemTotal(cartItem: any, extras: any[]) {
    const extrasTotalPrice = extras.reduce(
      (acc, extra: any) => acc + extra.price,
      0
    );
    return ((cartItem.menu.price + extrasTotalPrice) * cartItem?.units).toFixed(
      2
    );
  }

  getSubTotal() {
    return this.checkOutItems.reduce((acc, cartItem: any) => {
      const customMenuItemPrice = cartItem.customMenuItems.reduce(
        (customAcc: any, customItem: { price: any }) =>
          customAcc + customItem.price * cartItem.units,
        0
      );
      return acc + cartItem.menu.price * cartItem.units + customMenuItemPrice;
    }, 0);
  }

  toggleTransferModal() {
    const transferModal = document.querySelector('#transferModal') as any;
    if (transferModal) {
      transferModal.style.display = 'block';
    }
  }

  toggleAddressesModal() {
    const addressesModal = document.querySelector('#addressesModal') as any;
    if (addressesModal) {
      addressesModal.style.display = 'block';
    }
  }

  ngOnDestroy() {
    try {
      this.cartItems$?.unsubsribe();
      this.activatedRoute$?.unsubsribe();
    } catch {}
  }
}
