import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { catchError, from, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LexerTokenType } from '@angular/compiler';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'efielounge-accessToken';
  private refreshTokenKey = 'efielounge-refreshToken';
  userKey: string = 'user';

  constructor(private cookieService: CookieService, private router: Router) {}

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }

  storeTokens(loginResponse: any, storeRefresh = true) {
    this.cookieService.set('efielounge-accessToken', loginResponse.accessToken);
    if (storeRefresh) {
      this.cookieService.set(
        'efielounge-refreshToken',
        loginResponse.refreshToken
      );
    }
  }

  removeTokens() {
    this.cookieService.delete(this.tokenKey);
    this.cookieService.delete(this.refreshTokenKey);
    // localStorage.removeItem(this.tokenKey);
    // localStorage.removeItem(this.refreshTokenKey);
  }

  retrieveToken(tokenKey: string) {
    if (
      this.cookieService.get(tokenKey) &&
      this.cookieService.get(tokenKey) != ''
    ) {
      return this.cookieService.get(tokenKey);
    } else {
      return null;
    }
  }

  async refresh() {
    const refreshToken = this.retrieveToken('efielounge-refreshToken');
    if (refreshToken == undefined || refreshToken == 'undefined') {
      return this.logout();
    }
    try {
      const url = `${environment.api}/api/v1/auth/refresh-token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }
      const data = await response.json();
      return of(data);
    } catch {
      return of({ status: false });
    }
  }

  refreshObservable() {
    return from(this.refresh()).pipe(
      catchError((error) => {
        // this.refresh = false;
        return throwError(() => error);
      })
    );
  }

  removeUser() {
    // localStorage.removeItem(this.userKey);
    this.cookieService.delete(this.userKey);
  }

  logout() {
    this.removeUser();
    this.cookieService.delete('efielounge-accessToken');
    this.cookieService.delete('efielounge-refreshToken');
    window.localStorage.removeItem('efielounge-accessToken');
    window.localStorage.removeItem('efielounge-refreshToken');
    return this.router.navigateByUrl('/login');
  }
}
