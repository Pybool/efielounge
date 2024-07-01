import { Component, OnDestroy } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TruncateTextPipe } from '../../pipes/truncateTextPipe.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

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
  ],
  providers: [MenuService, CartService],
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
  public totalResultsCount:number = 0;

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

  searchFood() {
    this.noResults = false;
    this.showSpinner = true;
    this.menus = [];
    this.menuService
      .searchMenu(this.searchString)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.menus = response.data;
            this.menus.forEach((menu: any) => {
              menu.units = 1;
            });
            this.totalResultsCount = response.total;
            if (this.menus.length == 0) {
              this.noResults = true;
            }
          }
          this.showSpinner = false;
        },
        (error: any) => {
          this.showSpinner = false;
        }
      );
  }

  addToCart(menu: string, units: number) {
    const user = this.authService.retrieveUser();
    if (user) {
      this.authService.setLoggedIn(true);
      this.cartService
        .addToCart({ menu, units })
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            alert(response.message);
          },
          (error: any) => {
            console.log('error ', error, Object.keys(error));
            if ([401].includes(error.status)) {
              this.authService.navigateToUrl('/login');
            }
            else{
              alert("Something went wrong while peforming your request")
            }
          }
        );
    } else {
      this.authService.setLoggedIn(false);
    }
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
        if(item.likes > 0){
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

  ngOnDestroy() {
    this.activatedRoute$?.unsubscribe();
  }
}
