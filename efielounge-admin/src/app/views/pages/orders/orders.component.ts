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
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrderService } from '../../../services/order.service';
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-orders',
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
  providers: [OrderService],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  public orders: any[] = [];
  public serverUrl: string = environment.api;
  public selectedOrder: any = {};
  public index: number = -1;
  public account: any = {};
  public isReadOnly: boolean = true;
  public statuses = [
    'PENDING',
    'CONFIRMED',
    'DISPATCHED',
    'DELIVERED',
    'CANCELLED',
  ];
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 20;
  public totalPages = 0;
  public readyIn: number | null = null;
  public setReady: boolean = false;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.fetchOrders();
    this.setupScrollEventListener();
  }

  fetchOrders(fetch: boolean = true) {
    if (fetch) {
      this.loading = true;
      this.orderService
        .fetchOrders(this.page, this.pageSize)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.totalPages = response.totalPages;
              this.page++;
              for (let order of response.data) {
                order.readyIn = this.getTimeLeft(
                  order?.readyInSetAt,
                  order?.readyIn
                ) || 0;
              }
              this.orders.push(...response.data);
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            alert('Failed to order');
          }
        );
    }
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);

    // Format the date using Intl.DateTimeFormat
    const options: any = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  getTimeLeft(startTime: string, originalTimeSet: number) {
    const startDate = new Date(startTime);

    const readyDate: any = new Date(
      startDate.getTime() + originalTimeSet * 60000
    );
    const currentDate: any = new Date();
    const timeDiff: any = readyDate - currentDate;
    const remainingMinutes: number = Math.max(Math.floor(timeDiff / 60000), 0);

    return remainingMinutes;
  }

  setorderToEdit(index: number = 0) {
    this.index = index;
    this.selectedOrder = this.orders[index];
    this.account = this.selectedOrder.orders[0].account;
    this.readyIn = this.getTimeLeft(
      this.selectedOrder.readyInSetAt,
      this.selectedOrder.readyIn
    );
    console.log(this.selectedOrder);
    for (let order of this.selectedOrder.orders) {
      this.setFullName(order);
    }
  }

  setFullName(order: any) {
    let variantName = '';
    try {
      if (order.variants[0]) {
        variantName = ' ' + order.variants[0];
      } else {
        variantName = '';
      }
    } catch {
      variantName = '';
    }
    if (variantName) order.menu.name = `${order.menu.name}${variantName}`;
  }

  onSetReadyChange() {
    this.setReady = !this.setReady;
  }

  submit() {
    const payload: any = {
      checkOutId: this.selectedOrder.checkOutId,
      status: this.selectedOrder.status,
      notes: this.selectedOrder.notes,
      // deliveryCost: this.selectedOrder.deliveryCost
    };
    if (this.setReady) {
      payload.setReady = this.setReady;
      payload.readyIn = this.selectedOrder.readyIn;
    }
    this.orderService
      .updateOrderStatus(payload)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          Swal.fire(response.message);
          if (response.status) {
            const closeBtn = document.querySelector('.close-order') as any;
            if (closeBtn) {
              closeBtn.click();
            }
          }
        },
        (error: any) => {
          Swal.fire('Could not process your request at this time');
        }
      );
    console.log('Submission payload ==> ', payload);
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
          this.fetchOrders(true);
        }
      });
  }
}
