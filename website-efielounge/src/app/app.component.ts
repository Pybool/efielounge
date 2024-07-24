import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { CartDockedComponent } from './components/cart-docked/cart-docked.component';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CartDockedComponent, CommonModule],
  providers: [HttpClientModule, AuthService, CartService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'efielounge';
  public showCartModal: boolean = false;
  public cartCount = 0;
  public initialRequest = true;
  public user = null;
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

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const user = this.authService.retrieveUser();
    
    if (user) {
      this.user = user;
      this.authService.setLoggedIn(true);
    } else {
      this.authService.setLoggedIn(false);
      // this.authService.navigateToUrl("/login")
    }
    this.cartService.getCartCount().subscribe((count) => {
      this.cartCount = count;
    });

    this.cartService.getCartModalAndSelectedMenu().subscribe((data: any) => {
      this.showCartModal = data.showCartModal;
      this.selectedMenu = data.selectedMenu;
    });
  }

  cartDocker() {
    this.cartService.cartDocker();
  }

  toggleAddToCartModal() {
    this.cartService.toggleAddToCartModal();
  }

  handleBooleanEvent(value: boolean) {
    this.cartService.handleBooleanEvent(value);
  }

  orderNow(menu: any) {
    this.cartService.orderNow(menu);
  }
}
