import { CommonModule, DOCUMENT, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menuitem',
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
    CommonModule,
  ],
  providers: [CategoryService],
  templateUrl: './menuitem.component.html',
  styleUrl: './menuitem.component.scss',
})
export class MenuitemComponent {
  public name: string = '';
  public menuItems: any[] = [];
  public serverUrl: string = environment.api;
  public form: any = {
    name: 'Pure heaven',
    status: 'Available',
    price: 750,
    currency: 'GHC',
  };
  public attachments: FileList | null = null;
  public menuItemCategories: any[] = [];
  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService
      .fetchMenuItems()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuItems = response.data;
        }
      });

    this.categoryService
      .fetchMenuItemCategories()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuItemCategories = response.data;
        }
      });
  }

  onFileChange(event: any): void {
    this.attachments = event.target.files;
  }

  async createMenuItem(): Promise<void> {
    if (
      !this.attachments ||
      this.attachments.length === 0 ||
      !this.form.name ||
      !this.form.status ||
      !this.form.category
    ) {
      console.log('Please fill out all fields and select at least one image.');
      return;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(this.form));

    const firstFile = this.attachments[0];
    formData.append('attachments', firstFile);

    this.categoryService
      .createMenuItem(formData)
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuItems.unshift(response.data);
        }
        Swal.fire(response.message);
      });
  }

  // createMenuItem() {
  //   console.log(this.form);

  // }
}
