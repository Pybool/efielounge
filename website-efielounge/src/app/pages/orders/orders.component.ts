import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { OrderService } from '../../services/order.service';
import { HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    HttpClientModule,
    CommonModule,
  ],
  providers: [OrderService],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  public orders: any[] = [];
  public serverUrl: string = environment.api;

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 3000);
  }

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService
      .fetchOrders()
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.orders = response.data;
            console.log(this.orders);
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  formatUserFriendlyDate(dateString:string) {
    // Create a new Date object from the date string
    const date = new Date(dateString);
    
    // Define options for date and time formatting
    const dateOptions:any = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions:any = { hour: '2-digit', minute: '2-digit'};
    
    // Format date and time separately
    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
    
    // Combine formatted date and time
    return `${formattedDate} || ${formattedTime}`;
  }

}
