import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient, private router: Router) {}

  fetchOrders() {
    return this.http.get(`${environment.api}/api/v1/order/fetch-orders`);
  }

  rateMenu(payload: { rating: number; menu: string }) {
    return this.http.patch(
      `${environment.api}/api/v1/order/rate-menu`,
      payload
    );
  }
}
