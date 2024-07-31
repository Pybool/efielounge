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
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';
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
  public form: any = {};
  public attachments: FileList | null = null;
  public menuItemCategories: any[] = [];
  public selectedMenuItem: any = {};
  public menuItemIndex: number = 0;
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 10;
  public totalPages = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService
      .fetchMenuItemCategories(1,-1)// -1 means dont paginate
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.menuItemCategories = response.data;
          this.fetchMenuItems()
        }
      });
  }

  fetchMenuItems(fetch:boolean=true){
    if(fetch){
      this.loading = true;
      this.categoryService
        .fetchMenuItems(this.page, this.pageSize)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.totalPages = response.totalPages;
              this.page++;
              this.menuItems.push(...response.data);
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
      },((error:any)=>{
        Swal.fire("Could not process your request at this time")
      }));
  }

  setMenuItemToEdit(index: number) {
    this.menuItemIndex = index;
    
    this.selectedMenuItem = JSON.parse(JSON.stringify(this.menuItems[this.menuItemIndex]));
    this.selectedMenuItem.category = this.selectedMenuItem.category._id
    console.log(this.selectedMenuItem);
  }

  setCategory($event:any){
    this.selectedMenuItem.category = $event.target.value;
  }

  editMenuItem() {
    
    delete this.selectedMenuItem.attachments;
    delete this.selectedMenuItem.archive;
    delete this.selectedMenuItem.__v;

    console.log(this.selectedMenuItem);
    this.categoryService
      .editMenuItem(this.selectedMenuItem)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          alert(response.message);
        },
        ((error:any)=>{
          Swal.fire("Could not process your request at this time")
        })
      );
  }

  archiveMenuItem(index: number, archive: number = 1) {
    this.setMenuItemToEdit(index);
    this.menuItemIndex = index;
    this.categoryService
      .archiveMenuItem({
        _id: this.selectedMenuItem._id,
        archive: archive,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.menuItems = this.menuItems.filter(
            (element, idx) => idx !== index
          );
          alert(response.message);
        },
        ((error:any)=>{
          Swal.fire("Could not process your request at this time")
        })
      );
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
          this.fetchMenuItems(true);
        }
      });
  }
}
