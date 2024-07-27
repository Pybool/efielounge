import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, catchError, Observable, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  public homePageData: any = {};
  public homePagedata$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) {}

  getHomeData() {
    this.getClientHome()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.homePageData = response;
          this.setHomeData(this.homePageData)
        }
      });
  }

  setHomeData(data: any): void {
    this.homePagedata$.next(data);
  }

  getHomeDataObs(): Observable<any> {
    return this.homePagedata$.asObservable();
  }

  getClientHome() {
    return this.http.get(`${environment.api}/api/v1/admin/get-client-home`);
  }
}
