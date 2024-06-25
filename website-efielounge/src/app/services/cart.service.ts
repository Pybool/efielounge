import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private http: HttpClient, private router: Router) {}

  addToCart(payload: { menu: string; units: number }) {
    return this.http.post(
      `${environment.api}/api/v1/cart/add-to-cart`,
      payload
    );
  }

  getCart(checkOutId?: string) {
    return this.http.get(`${environment.api}/api/v1/cart/get-cart?checkOutId=${checkOutId}`);
  }

  removeFromCart(payload: { cartItemId: string }) {
    return this.http.patch(
      `${environment.api}/api/v1/cart/remove-from-cart`,
      payload
    );
  }

  updateCartItemsAndCheckOut(payload: any, checkOutId: string | null = null) {
    let url = `${environment.api}/api/v1/cart/checkout`
    if(checkOutId){
      url = `${environment.api}/api/v1/cart/checkout?checkOutId=${checkOutId}`
    }
    return this.http.put(
      url,
      payload
    );
  }
}

// http://127.0.0.1:8000/api/v1/cart/add-to-cart
