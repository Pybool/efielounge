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
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-categories-list',
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
  providers: [CategoryService],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent {
  public categories: any[] = [];

  public name: string = '';

  public selectedCategory: any = {};

  public categoryIndex: number = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService
      .fetchCategories()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.categories = response.data;
        }
      });
  }

  createCategory() {
    this.categoryService
      .createCategory({ name: this.name })
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.categories.unshift(response.data);
        }
        Swal.fire(response.message);
      });
  }

  setcategoryToEdit(index: number) {
    this.categoryIndex = index;
    console.log(this.categoryIndex);
    this.selectedCategory = this.categories[this.categoryIndex];
  }

  editMenuCategory() {
    console.log(this.selectedCategory);
    this.categoryService
      .editMenuCategory({
        _id: this.selectedCategory._id,
        name: this.selectedCategory.name,
      })
      .pipe(take(1))
      .subscribe((response: any) => {
          Swal.fire(response.message)
      },((error:any)=>{
        Swal.fire("Something went wrong")
      }));
  }

  archiveCategory(index:number, archive:number=1){

    this.setcategoryToEdit(index)
    this.categoryIndex = index;
    this.categoryService
      .archiveMenuCategory({
        _id: this.selectedCategory._id,
        archive: archive
      })
      .pipe(take(1))
      .subscribe((response: any) => {
        this.categories = this.categories.filter((element, idx) => idx !== index);
          Swal.fire(response.message)
      },((error:any)=>{
        Swal.fire("Something went wrong")
      }));
  }
}
