import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient, private router: Router) {}

  fetchTransactions(page:number, limit:number) {
    return this.http.get(
      `${environment.api}/api/v1/transactions/fetch-transactions?page=${page}&limit=${limit}`
    );
  }
}
