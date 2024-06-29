import { Component } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { take } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  providers: [MenuService, AuthService, TokenService, CartService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public user: any = null;
  public menuCategories: any[] = [];
  public cartLength = 0;
  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    if (this.user) {
      this.authService.setLoggedIn(true);
    } else {
      this.authService.setLoggedIn(false);
    }

    this.menuService
      .fetchCategories()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            this.menuCategories = response.data;
          }
        },
        (error: any) => {
          alert('Failed to fetch menu categories');
        }
      );

  }

  shortenEmail(email:string) {
    try {
      const [localPart, domain] = email.split('@');
      if (localPart.length > 4) {
          const shortenedLocalPart = localPart.slice(0, 4) + '...';
          return `${shortenedLocalPart}@${domain}`;
      } else {
          return email;
      }
  } catch (error) {
      return "Invalid email address";
  }
}

  logout(){
    this.tokenService.removeTokens()
    this.authService.logout()
  }
}
