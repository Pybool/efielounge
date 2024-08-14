import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { handleErrors } from '../global.error.handler';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenKey: string = 'efielounge-accessToken';
  userKey: string = 'user';
  loggedIn: boolean = false;
  loggedIn$: any = new BehaviorSubject(false);
  vendorSubscription: boolean = false;
  vendorSubscription$: any = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  setLoggedIn(status: boolean) {
    this.loggedIn = status;
    this.loggedIn$.next(this.loggedIn);
  }

  setAccountForReset(email: string) {
    this.cookieService.set('rsta', email);
  }

  getAccountForReset() {
    return this.cookieService.get('rsta');
  }

  getAuthStatus() {
    return this.loggedIn$.asObservable();
  }

  login(credentials: any) {
    return this.http.post(`${environment.api}/api/v1/auth/login`, credentials);
  }

  register(user: any) {
    return this.http.post(`${environment.api}/api/v1/auth/register`, user);
  }

  phoneNumberSendOtp(payload: {
    countryCode: string;
    dialCode: string;
    phone: string;
    messageType: string;
  }) {
    return this.http.post(`${environment.api}/api/v1/auth/phone-otp`, payload);
  }

  emailSendOtp(payload: { email: string; messageType: string }) {
    return this.http.post(`${environment.api}/api/v1/auth/email-otp`, payload);
  }

  phoneNumberLogin(payload: {
    dialCode: string;
    countryCode: string;
    phone: string;
    otp: number;
  }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/phone-login`,
      payload
    );
  }

  emailLogin(payload: { email: string; otp: number }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/email-login`,
      payload
    );
  }

  phoneNumberRegistration(payload: {
    phone: string;
    otp: number;
    dialCode: string;
    countryCode: string;
  }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/phone-register`,
      payload
    );
  }

  emailRegister(payload: { email: string; otp: number }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/email-register`,
      payload
    );
  }

  sendPasswordResetOtp(email: any) {
    return this.http.post(
      `${environment.api}/api/v1/auth/send-password-reset-otp`,
      { email }
    );
  }

  validatePhoneNumber(phoneNumber: string, areaCode: any): boolean {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, areaCode);

    if (parsedNumber && parsedNumber.isValid()) {
      return true;
    } else {
      return false;
    }
  }

  resetPassword(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/auth/reset-password`,
      payload
    );
  }

  resendOtp(user: any) {
    return this.http.post(
      `${environment.api}/api/v1/auth/resend-email-verification-otp`,
      user
    );
  }

  verifyAccount(payload: { email: string; otp: string | number }) {
    return this.http.put(
      `${environment.api}/api/v1/auth/verify-account`,
      payload
    );
  }

  updateProfile(user: any) {
    return this.http.put(
      `${environment.api}/api/v1/accounts/user-profile`,
      user
    );
  }

  retrieveToken(tokenKey: string) {
    if (
      this.cookieService.get(tokenKey) &&
      this.cookieService.get(tokenKey) != ''
    ) {
      return this.cookieService.get(tokenKey);
    } else {
      return window.localStorage.getItem(tokenKey);
    }
  }

  refresh() {
    const refreshToken = this.retrieveToken('efielounge-refreshToken');
    return this.http.post(`${environment.api}/api/v1/auth/refresh-token`, {
      refreshToken,
    });
  }

  storeTokens(loginResponse: any, storeRefresh = true) {
    this.cookieService.set('efielounge-accessToken', loginResponse.accessToken);
    if (storeRefresh) {
      this.cookieService.set(
        'efielounge-refreshToken',
        loginResponse.refreshToken
      );
      //Backup
      window.localStorage.setItem(
        'efielounge-refreshToken',
        loginResponse.refreshToken
      );
    }
    //Backup
    window.localStorage.setItem(
      'efielounge-accessToken',
      loginResponse.accessToken
    );
  }

  logout() {
    this.removeUser();
    this.setLoggedIn(false);
    this.cookieService.delete('efielounge-accessToken');
    this.cookieService.delete('efielounge-refreshToken');
    window.localStorage.removeItem('efielounge-accessToken');
    window.localStorage.removeItem('efielounge-refreshToken');
    //  this.router.navigateByUrl('/login');
    return (document.location.href = '/login');
  }

  uploadAvatar(formData: any) {
    return this.http
      .post(`${environment.api}/api/v1/accounts/upload-avatar`, formData)
      .pipe(
        tap((res: any) => {
          if (res.status) {
            this.storeUser(res?.data);
          }
        }),
        catchError((error) => {
          console.error('Avatar update failed', error);
          throw error;
        })
      );
  }

  getAgoraToken() {
    return this.http.post(`https://agoratoken.talkstuff.social/getToken`, {
      tokenType: 'rtc',
      channel: 'video-meet-001',
      role: 'publisher',
      uid: '001',
      expire: 3600,
    });
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  storeUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  retrieveUser() {
    try {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  removeUser() {
    localStorage.removeItem(this.userKey);
  }

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }
}
