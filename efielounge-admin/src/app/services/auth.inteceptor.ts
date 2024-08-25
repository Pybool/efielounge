import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refresh = false;

  constructor(private tokenService: TokenService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.tokenService.retrieveToken(
      'efielounge-admin-accessToken'
    );
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
          return this.tokenService.refreshObservable().pipe(
            switchMap((res: any) => {
              res.pipe(take(1)).subscribe((res: any) => {
                if (!res.status) {
                  this.tokenService.logout();
                } else {
                  this.tokenService.storeTokens(res);
                  return next.handle(
                    request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${this.tokenService?.retrieveToken(
                          'efielounge-admin-accessToken'
                        )}`,
                      },
                    })
                  );
                }
                return null;
              });
              return next.handle(
                request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${this.tokenService?.retrieveToken(
                      'efielounge-admin-accessToken'
                    )}`,
                  },
                })
              );
            })
          );
        }
        this.refresh = false;
        return throwError(() => err);
      })
    );
  }
}
