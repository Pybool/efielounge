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
  ],
  providers: [MenuService, CartService],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
})
export class MainMenuComponent implements OnDestroy {
  public units: number = 1;
  public menus: any[] = [];
  private activatedRoute$: any;
  public serverUrl: string = environment.api;

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.activatedRoute$ = this.route.queryParams.subscribe((params) => {
      this.menuService
        .fetchMenu(params)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              console.log(response.data);
              response.data.forEach((menu: any) => {
                menu.units = 1;
              });
              this.menus = response.data;
            }
          },
          (error: any) => {
            alert('Failed to fetch menu');
          }
        );
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

  addToCart(menu: string, units: number) {
    console.log(menu, units);
    this.cartService
      .addToCart({ menu, units })
      .pipe(take(1))
      .subscribe((response: any) => {
        alert(response.message);
      });
  }

  ngOnDestroy() {
    this.activatedRoute$?.unsubscribe();
  }
}
