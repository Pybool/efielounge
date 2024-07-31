
import { DOCUMENT, NgStyle } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ChartOptions } from 'chart.js';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  GutterDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ModalModule,
  ProgressBarComponent,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { WidgetsDropdownComponent } from 'src/app/views/widgets/widgets-dropdown/widgets-dropdown.component';
import { WidgetsBrandComponent } from 'src/app/views/widgets/widgets-brand/widgets-brand.component';
import { CategoryService } from '../../../../services/categories.service';
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-menuitem-categories',
  standalone: true,
  imports: [
    HttpClientModule,
    WidgetsDropdownComponent,
    ProgressBarComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
    ReactiveFormsModule,
    ButtonGroupComponent,
    FormCheckLabelDirective,
    ChartjsComponent,
    NgStyle,
    CardFooterComponent,
    GutterDirective,
    ProgressBarDirective,
    ProgressComponent,
    WidgetsBrandComponent,
    CardHeaderComponent,
    TableDirective,
    AvatarComponent,
    ModalModule,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers:[CategoryService],
  templateUrl: './menuitem-categories.component.html',
  styleUrl: './menuitem-categories.component.scss'
})
export class MenuitemCategoriesComponent {
  public categories: any[] = []

  public name: string = '';

  public selectedMenuItemCategory:any = {}

  public menuItemCategoryIndex:number = 0
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 10;
  public totalPages = 0;


  constructor(private categoryService: CategoryService) {}

  ngOnInit(){
    this.fetchMenuItemCategories();
    this.setupScrollEventListener();
  }

  fetchMenuItemCategories(fetch:boolean=true){
    if(fetch){
      this.loading = true;
      this.categoryService
        .fetchMenuItemCategories(this.page, this.pageSize)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.totalPages = response.totalPages;
              this.page++;
              this.categories.push(...response.data);
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            alert('Failed to fetch menu');
          }
        );
    }
  }

  createMenuItemCategory() {
    this.categoryService
      .createMenuItemCategory({ name: this.name })
      .pipe(take(1))
      .subscribe((response: any) => {
        if(response.status){
          this.categories.unshift(response.data)
        }
        Swal.fire(response.message)

      });
  }

  setMenuItemCategoryToEdit(index: number) {
    this.menuItemCategoryIndex = index;
    console.log(this.menuItemCategoryIndex);
    this.selectedMenuItemCategory = this.categories[this.menuItemCategoryIndex];
  }

  editMenuItemCategory() {
    console.log(this.selectedMenuItemCategory);
    this.categoryService
      .editMenuItemCategory({
        _id: this.selectedMenuItemCategory._id,
        name: this.selectedMenuItemCategory.name,
      })
      .pipe(take(1))
      .subscribe((response: any) => {
          alert(response.message)
      },((error:any)=>{
        alert("Something went wrong")
      }));
  }

  archiveMenuItemCategory(index:number, archive:number=1){

    this.setMenuItemCategoryToEdit(index)
    this.menuItemCategoryIndex = index;
    this.categoryService
      .archiveMenuItemCategory({
        _id: this.selectedMenuItemCategory._id,
        archive: archive
      })
      .pipe(take(1))
      .subscribe((response: any) => {
        this.categories = this.categories.filter((element, idx) => idx !== index);
          alert(response.message)
      },((error:any)=>{
        alert("Something went wrong")
      }));
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
          this.fetchMenuItemCategories(true);
        }
      });
  }
}
