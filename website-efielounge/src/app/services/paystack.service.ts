import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaystackService {
  private paystackPublicKey = '';

  constructor(private http: HttpClient) {
    // Initialize Paystack library
    this.http
      .get(`${environment.api}/api/v1/paystack/get-public-key`)
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          if (response.PUBLIC_KEY) {
            this.paystackPublicKey = response.PUBLIC_KEY;
            this.initializePaystack();
          } else {
            alert('Could not initiatialize payment modal');
          }
        } else {
          alert('Could not initiatialize payment modal');
        }
      });
  }

  private initializePaystack() {
    // Include Paystack JavaScript library
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    document.head.appendChild(script);
  }

  public initiatePayment(
    amount: number,
    email: string,
    callback: (response: any) => void
  ) {
    // Call Paystack inline method to initiate payment
    console.log("Amount ", amount, Math.ceil(amount))
    const handler = (window as any).PaystackPop.setup({
      key: this.paystackPublicKey,
      email,
      amount: Math.ceil(amount) * 100, // Paystack expects amount in kobo (smallest currency unit)
      callback,
      currency: 'GHS',
      channels: ['mobile_money', 'card'],
      channel_options: {
        mobile_money: [
          {
            key: 'MTN',
            value: 'MTN',
            isNew: false,
            phoneNumberRegex: '^\\+233(5(3|4|5|9)|2(4|5))\\d{7}$',
            phoneNumberPlaceholder: '050 000 0000',
          },
          {
            key: 'ATL',
            value: 'Airtel/Tigo',
            isNew: false,
            phoneNumberRegex: '^\\+233(5(6|7)|2(6|7))\\d{7}$',
            phoneNumberPlaceholder: '050 000 0000',
          },
          {
            key: 'VOD',
            value: 'Telecel (Formerly Vodafone)',
            isNew: false,
            phoneNumberRegex: '^\\+233(50|20)\\d{7}$',
            phoneNumberPlaceholder: '050 000 0000',
          },
        ],
      },
    });

    // Open Paystack payment dialog
    handler.openIframe();
  }

  public verifyTransaction(
    reference: string,
    callback: (response: any) => void
  ) {
    this.http
      .get(
        `${environment.api}/api/v1/transactions/paystack/verify-transaction?ref=${reference}`
      )
      .subscribe(callback);
  }
}
