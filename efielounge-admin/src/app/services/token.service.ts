import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  userKey: string = 'user';
  private tokenKey = 'efielounge-admin-accessToken';
  private refreshTokenKey = 'efielounge-admin-refreshToken';

  constructor(private cookieService: CookieService) {}

  storeTokens(loginResponse: any) {
    this.cookieService.set(this.tokenKey, loginResponse.accessToken);
    this.cookieService.set(this.refreshTokenKey, loginResponse.refreshToken);
    // Backup in localStorage
    localStorage.setItem(this.tokenKey, loginResponse.accessToken);
    localStorage.setItem(this.refreshTokenKey, loginResponse.refreshToken);
  }

  retrieveToken(tokenKey: string) {
    const token = this.cookieService.get(tokenKey) || localStorage.getItem(tokenKey);
    return token || null;
  }

  retrieveUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  removeTokens() {
    this.cookieService.delete(this.tokenKey);
    this.cookieService.delete(this.refreshTokenKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
