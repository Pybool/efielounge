import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { RemoveFromCartComponent } from '../../components/remove-from-cart/remove-from-cart.component';
import { Router } from '@angular/router';
import { EmptyCartComponent } from '../../components/empty-cart/empty-cart.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    RemoveFromCartComponent,
    EmptyCartComponent,
  ],
  providers: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  srcValues: any[] = [];
  public cartItems: any[] = [];
  public showCartMessage: string = '';
  public serverUrl: string = environment.api;
  public removeFromCart: boolean = false;
  public removal: { name: string; _id: string } = { name: '', _id: '' };
  public checkoutId: string = '';
  public showCheckOutSpinner: boolean = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    
  ) {
    
  }

  ngOnInit() {
    this.cartService
      .getCart()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.cartItems = response.data;
            this.showCartMessage = '';
          } else {
            this.showCartMessage =
              'Could not display your cart at this moment!';
          }
        },
        (error: any) => {
          this.showCartMessage = 'Could not display your cart at this moment!';
        }
      );
  }

  

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
  
    }, 100);
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

  addQty(cartItem: any) {
    if (cartItem.units < 50) {
      cartItem.units += 1;
    } else {
      alert('You can only place a maximum of 50 orders for the same menu');
    }
  }

  subQty(cartItem: any) {
    if (cartItem.units > 1) {
      cartItem.units -= 1;
    }
  }
}
