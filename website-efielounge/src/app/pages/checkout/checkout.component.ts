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
  ],
  providers: [CartService, PaystackService, AuthService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  public units: number = 1;
  public menus: any[] = [];
  public serverUrl: string = environment.api;
  public checkOutItems: any[] = [];
  public removeFromCart: boolean = false;
  public removal: { name: string; _id: string } = { name: '', _id: '' };
  public activatedRoute$: any;
  public checkOutId: any = null;
  public shippingCost = 5.0;
  public payment: { ref: string; amount: number | string } = {
    ref: this.checkOutId,
    amount: 0.0,
  };
  public paymentMethod: string = 'card';
  public user: any;

  constructor(
    private cartService: CartService,
    private route: ActivatedRoute,
    private paystackService: PaystackService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    if (!this.user) {
      this.router.navigateByUrl('/login');
    }
    this.activatedRoute$ = this.route.paramMap.subscribe((params) => {
      this.checkOutId = params.get('checkOutId') as string;
      console.log('this.checkOutId ', this.checkOutId);
      this.cartService
        .getCart(this.checkOutId)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.checkOutItems = response.data;
            }
          },
          (error: any) => {}
        );
    });
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 3000);
  }

  initiatePayment(amount: number, email: string, checkOutId: string) {
    return new Promise((resolve, reject) => {
      this.paystackService.initiatePayment(amount, email, (response) => {
        if (response.status === 'success') {
          resolve(this.verifyTransaction(response.reference, checkOutId));
        } else {
          reject(this.verifyTransaction(response.reference, checkOutId));
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
                this.router.navigate(['orders']);
              } else {
                alert(response.message);
              }
            });
        }
      }, 2000);
    });
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

  deleteObjectById(id: string) {
    const index = this.checkOutItems.findIndex(
      (obj: { _id: string }) => obj._id === id
    );

    if (index !== -1) {
      this.checkOutItems.splice(index, 1); // Remove the object at the found index
      return true;
    } else {
      return false;
    }
  }

  handleConfirmEvent() {
    console.log('Cart Item removed from cart ', this.removal.name);
    this.deleteObjectById(this.removal._id);
  }

  addQty(checkOutItem: any) {
    if (checkOutItem.units < 5) {
      checkOutItem.units += 1;
    } else {
      alert('You can only place a maximum of 5 orders for the same menu');
    }
  }

  subQty(checkOutItem: any) {
    if (checkOutItem.units > 1) {
      checkOutItem.units -= 1;
    }
  }

  checkOut() {
    this.cartService
      .updateCartItemsAndCheckOut(
        {
          cartItems: this.checkOutItems,
          amount: this.getSubTotal() + this.shippingCost,
        },
        this.checkOutId
      )
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            this.payment = {
              ref: this.checkOutId,
              amount: this.getSubTotal() + this.shippingCost,
            };
            this.checkOutId = response.data.checkOutId;
            if (this.paymentMethod == 'transfer') {
              this.toggleTransferModal();
            } else {
              this.initiatePayment(
                Math.round(Number(this.payment.amount)),
                this.user.email,
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

  getSubTotal() {
    return this.checkOutItems.reduce(
      (acc, cartItem: any) => acc + cartItem.menu.price * cartItem.units,
      0
    );
  }

  toggleTransferModal() {
    const transferModal = document.querySelector('#transferModal') as any;
    if (transferModal) {
      transferModal.style.display = 'block';
    }
  }
}
