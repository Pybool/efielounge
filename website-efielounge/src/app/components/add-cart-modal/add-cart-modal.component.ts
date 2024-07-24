import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './add-cart-modal.component.html',
  styleUrl: './add-cart-modal.component.scss',
})
export class AddCartModalComponent {
  public serverUrl: string = environment.api;
  public extras: string[] = [];
  public variants: string[] = [];
  @Input() selectedMenu: any = {
    _id: '',
    name: '',
    price: 0.0,
    image: '',
    description: '',
    extras: [],
    variants: [],
  };
  public orderTotal: number = 0.0;
  public units = 1;
  public orderUnitPrice: number = 0.0;
  public initMult = false;
  public lastVariantPrice: number = 0.0;
  public extrasTotal:number = 0.00;
  public variantPrice:number = 0.00;

  @Output() booleanEvent = new EventEmitter<boolean>();
  @Output() addedCartItem = new EventEmitter<boolean>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if(this.selectedMenu.variants.length > 0){
      this.selectedMenu.price = 0.00
    }
    this.orderTotal = Number(this.selectedMenu.price) * this.units;
    this.orderUnitPrice = this.orderTotal;
  }

  externalClose(event: any) {
    if (event.target.id == 'addToCartModal') {
      this.sendBoolean(event);
    }
  }

  sendBoolean(event: any, value: boolean = false) {
    this.booleanEvent.emit(value);
  }

  preventDefault(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  computeTotal(newPrice: number = 0.0) {
    if (!this.initMult) {
      this.orderUnitPrice += newPrice;
      this.extrasTotal = this.orderUnitPrice;
    } else {
      this.extrasTotal += newPrice;
    }
    this.orderTotal = this.extrasTotal + this.variantPrice
    this.lastVariantPrice = newPrice; 
  }

  updateExtras(extraId: string, price: number) {
    price = this.units * price;
    if (this.extras.includes(extraId)) {
      this.extras = this.extras.filter((item) => item !== extraId);
      this.computeTotal(price * -1);
    } else {
      this.extras.unshift(extraId);
      this.computeTotal(price);
    }
  }

  updateVariant(name: string, price: number) {
    price = this.units * price;
    this.variantPrice = price
    this.variants = [name]
    this.selectedMenu.price = price
    this.orderTotal = (this.extrasTotal + this.variantPrice) * this.units
     
  }

  addToCart() {
    const user = this.authService.retrieveUser();
    if (user) {
      this.authService.setLoggedIn(true);
      this;
      this.cartService.addToCartItems(
        this.selectedMenu,
        this.units,
        this.extras,
        this.variants
      );
    } else {
      this.authService.setLoggedIn(false);
      this.sendBoolean(false);
      this.router.navigateByUrl('/login');
    }
  }

  addQty() {
    if (this.units < 5) {
      this.units += 1;
      this.orderTotal = (this.extrasTotal + this.variantPrice) * this.units;
      this.initMult = true;
      console.log(this.orderUnitPrice);
    } else {
      alert('You can only place a maximum of 5 orders for the same menu');
    }
  }

  subQty() {
    if (this.units > 1) {
      this.units -= 1;
      console.log(this.orderTotal, this.orderUnitPrice);
      this.orderTotal = (this.extrasTotal + this.variantPrice) * this.units;
    }
  }

  disableButton() {
    if (this.selectedMenu.variants.length > 0 && this.variants.length == 0) {
      return true;
    }
    return false;
  }
}
