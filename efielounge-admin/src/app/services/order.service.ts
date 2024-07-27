import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient, private router: Router) {}

  fetchOrders(filter: string = 'all') {
    return this.http.get(
      `${environment.api}/api/v1/order/fetch-orders?filter=${filter}`
    );
  }

  updateOrderStatus(payload: any) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/orders/update-order-status`,
      payload
    );
  }
}
