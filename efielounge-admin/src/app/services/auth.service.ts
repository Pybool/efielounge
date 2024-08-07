import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenKey: string = 'efielounge-admin-accessToken';
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

  getAuthStatus() {
    return this.loggedIn$.asObservable();
  }

  login(credentials: any) {
    return this.http.post(`${environment.api}/api/v1/auth/login`, credentials);
  }

  fetchDashBoardData(limit:number) {
    return this.http.get(`${environment.api}/api/v1/admin/dashboard?page=1&limit=${limit}`);
  }

  register(user: any) {
    return this.http.post(`${environment.api}/api/v1/auth/register`, user);
  }

  sendPasswordResetOtp(email: any) {
    return this.http.post(`${environment.api}/api/v1/auth/send-password-reset-otp`, {email});
  }

  resetPassword(payload: any) {
    return this.http.post(`${environment.api}/api/v1/auth/reset-password`, payload);
  }

  resendOtp(user: any) {
    return this.http.post(`${environment.api}/api/v1/auth/resend-email-verification-otp`, user);
  }

  verifyAccount(payload: {email:string, otp:string | number}) {
    return this.http.put(`${environment.api}/api/v1/auth/verify-account`, payload);
  }

  updateProfile(user: any) {
    return this.http.put(`${environment.api}/api/v1/auth/user-profile`, user);
  }

  refresh() {
    const refreshToken = this.retrieveToken('efielounge-admin-refreshToken');
    return this.http.post(`${environment.api}/api/v1/auth/refresh-token`, {
      refreshToken,
    });
  }

  storeTokens(loginResponse: any, storeRefresh = true) {
    this.cookieService.set('efielounge-admin-accessToken', loginResponse.accessToken);
    if (storeRefresh) {
      this.cookieService.set(
        'efielounge-admin-refreshToken',
        loginResponse.refreshToken
      );
      //Backup
      window.localStorage.setItem(
        'efielounge-admin-refreshToken',
        loginResponse.refreshToken
      );
    }
    //Backup
    window.localStorage.setItem(
      'efielounge-admin-accessToken',
      loginResponse.accessToken
    );
  }

  logout() {
    this.removeUser();
    this.setLoggedIn(false);
    this.cookieService.delete('efielounge-admin-accessToken');
    this.cookieService.delete('efielounge-admin-refreshToken');
    window.localStorage.removeItem('efielounge-admin-accessToken');
    window.localStorage.removeItem('efielounge-admin-refreshToken');
    return this.router.navigateByUrl('/login');
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

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  storeUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  retrieveUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem(this.userKey);
  }

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }
}
