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
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OrderService } from '../../../services/order.service';

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
    'IN-TRANSIT',
    'DELIVERED',
    'CANCELED',
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService
      .fetchOrders()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.orders = response.data;
          } else {
            alert(response.message);
          }
        },
        (error: any) => {
          alert('could not fetch orders at this time');
        }
      );
  }

  setorderToEdit(index: number = 0) {
    this.index = index;
    this.selectedOrder = this.orders[index];
    this.account = this.selectedOrder.orders[0].account;
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

  submit() {
    const payload = {
      checkOutId: this.selectedOrder.checkOutId,
      status: this.selectedOrder.status,
      notes: this.selectedOrder.notes,
      // deliveryCost: this.selectedOrder.deliveryCost
    };
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
          alert('Something went wrong');
        }
      );
    console.log('Submission payload ==> ', payload);
  }
}
