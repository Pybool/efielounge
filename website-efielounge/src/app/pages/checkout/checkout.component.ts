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
import { ActivatedRoute } from '@angular/router';
import { DirectBankTransferModalComponent } from '../../components/direct-bank-transfer-modal/direct-bank-transfer-modal.component';

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
  providers: [CartService],
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
  public payment:{ref:string, amount: number | string} = {
    ref: this.checkOutId,
    amount:  0.00,
  };

  constructor(
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute$ = this.route.paramMap.subscribe((params) => {
      this.checkOutId = params.get('checkOutId') as string;
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
      return true; // Indicate successful deletion
    } else {
      return false; // Indicate object not found
    }
  }

  handleConfirmEvent() {
    console.log('Cart Item removed from cart ', this.removal.name);
    this.deleteObjectById(this.removal._id);
  }

  addQty(checkOutItem: any) {
    checkOutItem.units += 1;
  }

  subQty(checkOutItem: any) {
    checkOutItem.units -= 1;
  }

  checkOut() {
    this.cartService
      .updateCartItemsAndCheckOut(
        { cartItems: this.checkOutItems },
        this.checkOutId
      )
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            this.payment = {
              ref: this.checkOutId,
              amount: (this.getSubTotal() + this.shippingCost)
                
            };
            console.log(this.payment)
            this.toggleTransferModal();
            this.checkOutId = response.data.checkOutId;
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
