import { Component, OnDestroy } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TruncateTextPipe } from '../../pipes/truncateTextPipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { InfiniteLoaderSpinnerComponent } from '../../components/infinite-loader-spinner/infinite-loader-spinner.component';
import { CartDockedComponent } from '../../components/cart-docked/cart-docked.component';

@Component({
  selector: 'app-search-result-component',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TruncateTextPipe,
    InfiniteLoaderSpinnerComponent,
    CartDockedComponent
  ],
  providers: [MenuService],
  templateUrl: './search-result-component.component.html',
  styleUrl: './search-result-component.component.scss',
})
export class SearchResultComponentComponent implements OnDestroy {
  public units: number = 1;
  public menus: any[] = [];
  private activatedRoute$: any;
  public serverUrl: string = environment.api;
  public searchString: string = '';
  public showSpinner: boolean = false;
  public noResults: boolean = false;
  public totalResultsCount: number = 0;
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 20;
  public totalPages = 0;
  public showCartModal: boolean = false;
  public menuCategories: any[] = [];
  public params: any;
  public selectedMenu:
    | { _id:string;
        name?: string;
        price?: string;
        image: string;
        description: string;
        extras?: any[];
      }
    | any = {};

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.activatedRoute$ = this.route.queryParams.subscribe((params) => {
      this.searchString = params?.['q'];
      this.searchFood();
      this.fetchCategories();
      this.setupScrollEventListener();
    });
  }

  fetchCategories() {
    this.menuService
      .fetchCategories()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.menuCategories = response.data;
            this.setActiveMenu();
          }
        },
        (error: any) => {
          alert('Failed to fetch menu categories');
        }
      );
  }

  setActiveMenu() {
    try {
      setTimeout(() => {
        let filter = 'default'
        if(this.params['filter']){
          filter = this.params['filter']
        }
        const id = 'breadcrumb-'+ filter;
        const activeEl = document.getElementById(id) as HTMLElement;
        const breadCrumbs = document.querySelectorAll('.breadcrumb-item') as any;
        for( let breadCrumb of breadCrumbs){
          breadCrumb.classList.remove('active');
        };
        if (activeEl) {
          activeEl.parentElement!.classList.add('active');
        }
      }, 100);
    } catch (error) {}
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  searchFood(isFresh: boolean = false) {
    if (isFresh) {
      this.page = 1;
      this.menus = [];
    }
    this.noResults = false;
    this.showSpinner = true;
    this.loading = true;
    this.menuService
      .searchMenu(this.page, this.pageSize, this.searchString)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.totalPages = response.totalPages;
            this.page++;
            this.menus.forEach((menu: any) => {
              menu.units = 1;
            });
            response.data.forEach((menu: any) => {
              if (!this.menus.find((item: any) => item._id === menu._id)) {
                this.menus.push(menu);
              }
            });
            this.totalResultsCount = response.total;
            if (this.menus.length == 0) {
              this.noResults = true;
            }
          }
          this.loading = false;
          this.showSpinner = false;
        },
        (error: any) => {
          this.loading = false;
          this.showSpinner = false;
        }
      );
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
    const menusToUpdate = [this.menus];

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

  setupScrollEventListener() {
    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => {
          const scrollPosition = window.pageYOffset + window.innerHeight;
          const maxScroll = document.documentElement.scrollHeight;
          const threshold = window.innerHeight * 2;
          return !this.loading && maxScroll - scrollPosition < threshold;
        })
      )
      .subscribe(() => {
        if (this.page <= this.totalPages) {
          this.searchFood();
        }
      });
  }

  ngOnDestroy() {
    this.activatedRoute$?.unsubscribe();
  }
}
