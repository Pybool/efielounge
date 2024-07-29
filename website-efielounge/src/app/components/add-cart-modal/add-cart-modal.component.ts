import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './add-cart-modal.component.html',
  styleUrl: './add-cart-modal.component.scss',
})
export class AddCartModalComponent implements AfterViewInit {
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
  public extrasTotal: number = 0.0;
  public variantPrice: number = 0.0;
  public baseVariant: any = null;
  public showMaxUnitsError = false
  public clonedMenu: any = {
    _id: '',
    name: '',
    price: 0.0,
    image: '',
    description: '',
    extras: [],
    variants: [],
  };

  @Output() booleanEvent = new EventEmitter<boolean>();
  @Output() addedCartItem = new EventEmitter<boolean>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.clonedMenu = JSON.parse(JSON.stringify(this.selectedMenu));
    this.orderTotal = Number(this.selectedMenu.price) * this.units;
    this.orderUnitPrice = this.orderTotal;
  }

  ngAfterViewInit() {
    this.getBaseVariant();
    console.log(this.getBaseVariant());
    if (this.baseVariant) {
      const baseVariantEl = document.querySelector(
        `#add-${this.baseVariant.name.replaceAll(' ', '-').toLowerCase()}`
      ) as any;
      if (baseVariantEl) {
        console.log('baseVariantEl ', baseVariantEl);
        baseVariantEl.click();
        this.updateVariant(this.baseVariant.name, this.baseVariant?.price);
      }
    }
  }

  getBaseVariant() {
    try {
      for (let variant of this.selectedMenu.variants) {
        if (Number(variant.price) === 0) {
          this.baseVariant = variant;
          return variant;
        }
      }
      return null;
    } catch {
      return null;
    }
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
    this.orderTotal =
      this.selectedMenu.price + this.extrasTotal + this.variantPrice;
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
    // price = this.units * price;
    this.variantPrice = price;
    this.variants = [name];
    this.selectedMenu.price =
      Number(this.clonedMenu.price) + Number(this.variantPrice);
    console.log(Number(this.clonedMenu.price), Number(this.variantPrice));
    this.orderTotal =
      (Number(this.clonedMenu.price) +
        this.extrasTotal +
        Number(this.variantPrice)) *
      this.units;
  }

  addToCart() {
    const user = this.authService.retrieveUser();
    if (user) {
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

  typedQuatity() {
    if(this.units > 50){
      this.units = 1
      this.showMaxUnitsError = true
    }else{
      this.showMaxUnitsError = false
    }
    this.orderTotal =
      (Number(this.clonedMenu.price) +
        this.extrasTotal +
        Number(this.variantPrice)) *
      this.units;
  }

  addQty() {
    if (this.units < 50) {
      this.units += 1;
      this.orderTotal =
        (Number(this.clonedMenu.price) +
          this.extrasTotal +
          Number(this.variantPrice)) *
        this.units;
      this.initMult = true;
    } else {
      alert('You can only place a maximum of 50 orders for the same menu');
    }
  }

  subQty() {
    if (this.units > 1) {
      this.units -= 1;
      this.orderTotal =
        (Number(this.clonedMenu.price) +
          this.extrasTotal +
          Number(this.variantPrice)) *
        this.units;
    }
  }

  disableButton() {
    if (this.selectedMenu.variants.length > 0 && this.variants.length == 0) {
      return true;
    }
    return false;
  }
}
