import { Component, OnDestroy } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TruncateTextPipe } from '../../pipes/truncateTextPipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { InfiniteLoaderSpinnerComponent } from '../../components/infinite-loader-spinner/infinite-loader-spinner.component';
import { CartDockedComponent } from '../../components/cart-docked/cart-docked.component';
import { AddCartModalComponent } from '../../components/add-cart-modal/add-cart-modal.component';

@Component({
  selector: 'app-main-menu',
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
    CartDockedComponent,
    AddCartModalComponent,
  ],
  providers: [MenuService],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
})
export class MainMenuComponent implements OnDestroy {
  public units: number = 1;
  public menus: any[] = [];
  private activatedRoute$: any;
  public serverUrl: string = environment.api;
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 20;
  public totalPages = 0;
  public showCartModal: boolean = false;
  public menuCategories: any[] = [];
  public params: any;
  public searchString: string | null = null;
  public selectedMenu:
    | {
        _id: string;
        name?: string;
        price?: string;
        image: string;
        description: string;
        extras?: any[];
        variants?: any[];
      }
    | any = {};

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute$ = this.route.queryParams.subscribe((params) => {
      this.params = params;
      this.fetchMenu(params);
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

  fetchMenu(params: any) {
    this.loading = true;
    this.menuService
      .fetchMenu(this.page, this.pageSize, params)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.totalPages = response.totalPages;
            this.page++;
            response.data.forEach((menu: any) => {
              menu.units = 1;
            });
            this.menus.push(...response.data);
          }
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          alert('Failed to fetch menu');
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
          this.fetchMenu(false);
        }
      });
  }

  searchFood() {
    this.router.navigateByUrl(`/search-menu?q=${this.searchString}`);
  }

  inlineFiltering() {
    this.menus.sort((a: { name: string }, b: { name: string }) => {
      const aStartsWith = a.name.toLowerCase().startsWith(this.searchString!.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(this.searchString!.toLowerCase());
  
      // If both names start with the search string or both don't start with it, sort alphabetically
      if (aStartsWith && bStartsWith) {
        return a.name.localeCompare(b.name);
      }
      
      // If only one of the names starts with the search string, it should come first
      if (aStartsWith) return -1;
      if (bStartsWith) return 1;
  
      // If neither name starts with the search string, check if they contain it
      const aIncludes = a.name.toLowerCase().includes(this.searchString!.toLowerCase());
      const bIncludes = b.name.toLowerCase().includes(this.searchString!.toLowerCase());
  
      if (aIncludes && bIncludes) {
        return a.name.localeCompare(b.name);
      }
      
      if (aIncludes) return -1;
      if (bIncludes) return 1;
  
      // If neither name includes the search string, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }
  

  ngOnDestroy() {
    this.activatedRoute$?.unsubscribe();
  }
}
