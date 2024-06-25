import { Component, OnDestroy } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-detail',
  standalone: true,
  imports: [PreloaderComponent, HeaderComponent, FooterComponent, CommonModule, CarouselComponent],
  providers: [MenuService],
  templateUrl: './food-detail.component.html',
  styleUrl: './food-detail.component.scss'
})
export class FoodDetailComponent implements OnDestroy {

  public activatedRoute$:any;
  public activeMenu:string = "";
  public menuData:any = {};
  public serverUrl:string = environment.api
  public useMaxRes:boolean = false; //Switch between image resolutions

  constructor(private menuService: MenuService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute$ = this.route.paramMap.subscribe(params => {
      this.activeMenu = params.get('menuslug') as string;

      this.menuService
      .fetchMenuDetail(this.activeMenu)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.menuData = response.data
          }
        },
        (error: any) => {
          alert('Failed to fetch menu');
        }
      );
    });

  }

  ngAfterViewInit(){
    const pageLoader = document.querySelector(".loader-container") as HTMLElement;
    setTimeout(()=>{
      pageLoader.style.display = 'none';
    },3000)
  }

  ngOnDestroy(){
    this.activatedRoute$?.unsubscribe()
  }
}
