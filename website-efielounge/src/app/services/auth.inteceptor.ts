import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
// import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refresh = false;

  constructor(
    private tokenService: TokenService,
    // private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.tokenService.retrieveToken('efielounge-accessToken');
    let req = request;

    if (!request.url.includes('external') && authToken) {
      req = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if ((err.status === 401 || err.status === 403) && !this.refresh) {
          this.refresh = true;
          // return this.tokenService.refresh().pipe(
          //   switchMap((res: any) => {
          //     if (!res.status) {
          //       // this.authService.logout();
          //     } else {
          //       this.tokenService.storeTokens(res);
          //       const newAuthToken = this.tokenService.retrieveToken('efielounge-accessToken');
          //       return next.handle(
          //         request.clone({
          //           setHeaders: {
          //             Authorization: `Bearer ${newAuthToken}`,
          //           },
          //         })
          //       );
          //     }
          //     return throwError(() => new Error('Unauthorized'));
          //   })
          // );
        }
        this.refresh = false;
        return throwError(() => err);
      })
    );
  }
}