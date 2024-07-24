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
  selector: 'app-menu',
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
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  public name: string = '';
  public menus: any[] = [];
  public serverUrl: string = environment.api;
  public form: any = {
    name: 'Pure heaven',
    status: 'Available',
    price: 750,
    currency: 'GH₵',
    variants: [],
  };
  public variant: { name?: string; price?: number | null } = { price:null };
  public attachments: FileList | null = null;
  public menuCategories: any[] = [];
  public menuItems: any[] = [];
  public statuses: string[] = ['Cooking', 'Ready', "You're Too Late"];
  public selectedMenu: any = {};
  public menuIndex: number = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService
      .fetchMenu()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menus = response.data;
        }
      });

    this.categoryService
      .fetchCategories()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuCategories = response.data;
        }
      });

    this.categoryService
      .fetchMenuItems()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuItems = response.data;
        }
      });

      console.log("Variant ", this.variant)
  }

  addVariant() {
    const variantName = this.variant.name!?.trim().toLowerCase();
    const variantExists = this.form.variants.some(
      (v: { name: string }) => v.name.trim().toLowerCase() === variantName
    );

    if (variantName !== '' && !variantExists) {
      return this.form.variants.unshift(
        JSON.parse(JSON.stringify(this.variant))
      );
    } else {
      return alert(`${this.variant.name} has already been added`);
    }
  }

  updateVariant() {
    const variantName = this.variant.name!?.trim().toLowerCase();
    const variantExists = this.selectedMenu.variants.some(
      (v: { name: string }) => v.name?.trim()?.toLowerCase() === variantName
    );

    if (variantName !== '' && !variantExists) {
      return this.selectedMenu.variants.unshift(
        JSON.parse(JSON.stringify(this.variant))
      );
    } else {
      return alert(`${this.variant.name} has already been added`);
    }
  }

  removeVariant(arr: any[], variantName: string, update = false) {
    const confirmation = confirm(
      'Are you sure you want to remove this variant?'
    );
    if (!confirmation) {
      return null;
    }

    const removeFromArray = (arr: any[], variantName: string) => {
      return arr.filter(
        (item) =>
          item.name?.trim()?.toLowerCase() !== variantName?.trim()?.toLowerCase()
      );
    };

    if (update) {
      this.selectedMenu.variants = removeFromArray(arr, variantName);
      this.editMenu();
    } else {
      this.form.variants = removeFromArray(arr, variantName);
    }

    return null;
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
    for (let i = 0; i < this.attachments.length; i++) {
      formData.append('attachments', this.attachments[i]);
    }

    this.categoryService
      .createMenu(formData)
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menus.unshift(response.data);
        }
        Swal.fire(response.message);
      });
  }

  setMenuToEdit(index: number) {
    this.menuIndex = index;
    this.selectedMenu = JSON.parse(JSON.stringify(this.menus[this.menuIndex]));
    this.selectedMenu.category = this.selectedMenu.category._id;
    console.log(this.selectedMenu)
    this.variant = {}
  }

  setCategory($event: any) {
    this.selectedMenu.category = $event.target.value;
    console.log('Category ', this.selectedMenu.category);
  }

  cleanPayload() {
    delete this.selectedMenu.attachments;
    delete this.selectedMenu.archive;
    delete this.selectedMenu.__v;
    delete this.selectedMenu.iLiked;
    delete this.selectedMenu.iRated;
    delete this.selectedMenu.inCart;
    delete this.selectedMenu.likes;
    delete this.selectedMenu.ratings;
    delete this.selectedMenu.slug;
  }

  editMenu() {
    this.cleanPayload();
    console.log(this.selectedMenu);
    this.categoryService
      .editMenu(this.selectedMenu)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          alert(response.message);
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }

  archiveMenu(index: number, archive: number = 1) {
    this.setMenuToEdit(index);
    this.menuIndex = index;
    this.categoryService
      .archiveMenu({
        _id: this.selectedMenu._id,
        archive: archive,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.menus = this.menus.filter((element, idx) => idx !== index);
          alert(response.message);
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }
}
