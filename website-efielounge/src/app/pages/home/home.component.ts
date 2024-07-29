import { Component, EventEmitter, Output } from '@angular/core';
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
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartDockedComponent } from '../../components/cart-docked/cart-docked.component';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TruncateTextPipe,
    ScrollIntoViewDirective,
    CartDockedComponent,
  ],
  providers: [AuthService, MenuService],
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
  public searchString: string | null = null;
  public serverUrl: string = environment.api;
  public page: number = 1;
  public pageSize: number = 3;
  public _showCartModal: boolean = false;
  public cartCount = 0;
  public initialRequest = true;
  public home: any = {};
  public banner: string = '';
  public homePageData: any = {};
  @Output() showCartModal = new EventEmitter<boolean>();

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
    private menuService: MenuService,
    private cartService: CartService,
    private authService: AuthService,
    private homeService: HomeService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  ngOnInit() {
    this.menuService
      .fetchMenu(this.page, this.pageSize, {
        status: 'Ready',
        limit: this.pageSize,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.readyMeals = response.data;
          }
        },
        (error: any) => {
          console.log('Failed to fetch menu');
        }
      );

    this.menuService
      .fetchMenu(this.page, this.pageSize, {
        status: 'Cooking',
        limit: this.pageSize,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.upcomings = response.data;
          }
        },
        (error: any) => {
          console.log('Failed to fetch menu');
        }
      );
    this.homeService.getHomeDataObs().subscribe((homePageData: any) => {
      this.homePageData = homePageData;
      this.home = this.homePageData.home;
      if (this.home?.banner) {
        this.banner =
          environment.api +
          this.home?.banner
            .replace('/public', '')
            .replace('/efielounge-backend', '');
      }
    });
  }

  onUserfavouritesVisible() {
    if (this.favourites.length == 0) {
      this.menuService
        .fetchUserFavouriteMenu()
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
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
              this.categories = response.data;
            }
          },
          (error: any) => {
            console.log('Failed to fetch menu categories');
          }
        );

      this.menuService
        .fetchMenu(this.page, this.pageSize, {})
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
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
      .fetchMenu(this.page, this.pageSize, filter)
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
    // const user = this.authService.retrieveUser();
    // if (user) {
    //   this.authService.setLoggedIn(true);
    //   this.cartService
    //     .addToCart({ menu, units })
    //     .pipe(take(1))
    //     .subscribe(
    //       (response: any) => {
    //         alert(response.message);
    //       },
    //       (error: any) => {
    //         console.log('error ', error, Object.keys(error));
    //       }
    //     );
    // } else {
    //   this.authService.setLoggedIn(false);
    //   this.authService.navigateToUrl('/login');
    // }
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
        if (item.likes > 0) {
          item.likes -= 1;
        }
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

  searchFood() {
    this.router.navigateByUrl(`/search-menu?q=${this.searchString}`);
  }
}
