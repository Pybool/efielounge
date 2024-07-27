import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientSiteService {
  constructor(private http: HttpClient) {}

  changeBanner(payload: FormData) {
    return this.http.post(
      `${environment.api}/api/v1/admin/change-banner-image`,
      payload
    );
  }

  getClientHome() {
    return this.http.get(`${environment.api}/api/v1/admin/get-client-home`);
  }

  createPromotion(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/admin/website/create-promotion`,
      payload
    );
  }

  activatePromotion(payload: any) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/website/activate-promotion`,
      payload
    );
  }

  deletePromotion(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/admin/website/delete-promotion`,
      payload
    );
  }
}
