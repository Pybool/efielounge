import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { take } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TruncateTextPipe } from '../../pipes/truncateTextPipe.pipe';
import { ScrollIntoViewDirective } from '../../directives/scroll-into-view.directive'; // Adjust the import path as necessary
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    HttpClientModule,
    CommonModule,
    TruncateTextPipe,
    ScrollIntoViewDirective,
  ],
  providers: [AuthService, CartService, MenuService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public readyMeals: any[] = [];
  public upcomings: any[] = [];
  public favourites: any[] = [];
  public mostPopular: any[] = [];
  public categories: any[] = [];
  public filteredMenus: any[] = [];
  public filteredMenusCache: any[] = [];
  public serverUrl: string = environment.api;

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 3000);
  }

  ngOnInit() {
    // https://be.efielounge.com/api/v1/menu/fetch-menu?status=Ready&limit=3
    this.menuService
      .fetchMenu({ status: 'Ready', limit: 3 })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            this.readyMeals = response.data;
          }
        },
        (error: any) => {
          console.log('Failed to fetch menu');
        }
      );

    this.menuService
      .fetchMenu({ status: 'Cooking', limit: 3 })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            this.upcomings = response.data;
          }
        },
        (error: any) => {
          console.log('Failed to fetch menu');
        }
      );
  }

  onUserfavouritesVisible() {
    if (this.favourites.length == 0) {
      this.menuService
        .fetchUserFavouriteMenu()
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              console.log(response.data);
              this.favourites = response.data;
            }
          },
          (error: any) => {
            console.log('Failed to fetch menu');
          }
        );
    }
  }

  onMostPopularVisible() {
    if (this.mostPopular.length == 0) {
      this.menuService
        .fetchMostPopularMenu()
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              console.log(response.data);
              this.mostPopular = response.data;
            }
          },
          (error: any) => {
            console.log('Failed to fetch menu');
          }
        );
    }
  }

  onMiniFilterMenus() {
    if (this.categories.length == 0) {
      this.menuService
        .fetchCategories()
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              console.log(response.data);
              this.categories = response.data;
            }
          },
          (error: any) => {
            console.log('Failed to fetch menu categories');
          }
        );

      this.menuService
        .fetchMenu({})
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              console.log(response.data);
              this.filteredMenus = response.data.slice(0, 6);
              this.filteredMenusCache = JSON.parse(
                JSON.stringify(response.data.slice(0, 6))
              );
            }
          },
          (error: any) => {
            console.log('Failed to fetch menu');
          }
        );
    }
  }

  filterByCategory(category: any = null, $event: any) {
    this.activateLink($event);
    if (!category) {
      this.filteredMenus = this.filteredMenusCache;
      return null;
    }
    const filter = { field: 'category', filter: category._id };
    this.menuService
      .fetchMenu(filter)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            console.log(response.data);
            response.data.forEach((menu: any) => {
              menu.units = 1;
            });
            this.filteredMenus = response.data.slice(0, 6);
          }
        },
        (error: any) => {
          alert('Failed to fetch menu');
        }
      );
    return null;
  }

  activateLink($event: any) {
    const links = document.querySelectorAll('.filter-buttons li') as any;
    links.forEach((link: any) => {
      link.classList.remove('active');
    });
    if ($event.target) {
      $event.target?.closest('li')?.classList?.add('active');
    }
  }

  addToCart(menu: string, units: number = 1) {
    const user = this.authService.retrieveUser();
    if (user) {
      this.authService.setLoggedIn(true);
      this.cartService
        .addToCart({ menu, units })
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              const count = this.cartService.getCartItemCount(false);
              this.cartService.setCartItemCount(units + count);
            }
            alert(response.message);
          },
          (error: any) => {
            console.log('error ', error, Object.keys(error));
            if ([400, 401].includes(error.status)) {
              this.authService.navigateToUrl('/login');
            }
          }
        );
    } else {
      this.authService.setLoggedIn(false);
      this.authService.navigateToUrl('/login');
    }
  }

  async likeMenu(_id: string) {
    const user = this.authService.retrieveUser();
    if (!user) {
      this.authService.setLoggedIn(false);
      return this.authService.navigateToUrl('/login');
    }
    const menusToUpdate = [
      this.readyMeals,
      this.upcomings,
      this.favourites,
      this.mostPopular,
      this.filteredMenus,
      this.filteredMenusCache,
    ];

    const response = await this.likeRequest(_id);
    if (response?.status) {
      menusToUpdate.forEach(async (menus: any) => {
        await this.getAndUpdateArrayItemById(menus, _id);
      });
    }
  }

  async getAndUpdateArrayItemById(arr: any, _id: string) {
    const item = arr.find((item: any) => item._id === _id);

    if (item) {
      if (!item?.iLiked) {
        item.likes += 1;
        item.iLiked = true;
      } else {
        item.likes -= 1;
        item.iLiked = false;
      }
      return true; // Indicate that the item was found and updated
    } else {
      return false; // Indicate that the item was not found
    }
  }

  async likeRequest(_id: string) {
    const token = this.authService.retrieveToken(this.authService.tokenKey!)!;
    const response = await this.menuService.likeMenu(_id, token);
    return response;
  }

  searchFood(){
    Swal.fire("Coming soon!!")
  }
}
