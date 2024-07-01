import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  
  constructor(private http: HttpClient) {}

  setCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  addToCart(payload: { menu: string; units: number }): Observable<any> {
    return this.http.post(`${environment.api}/api/v1/cart/add-to-cart`, payload).pipe(
      tap((res:any) => {
        const currentCount = this.cartCountSubject.value;
        console.log("Res ", res)
        if(!res?.isMerged){
          this.cartCountSubject.next( 1);
        }
        
      }),
      catchError((error) => {
        // Handle the error as needed
        console.error('Add to cart failed', error);
        throw error;
      })
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
