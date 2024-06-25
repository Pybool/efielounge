import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient, private router: Router) {}

  fetchCategories() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menu-categories`
    );
  }

  fetchMenu(params: any) {
    let url = `${environment.api}/api/v1/menu/fetch-menu`;
    if (
      Object.keys(params).includes('field') &&
      Object.keys(params).includes('filter')
    ) {
      url = `${environment.api}/api/v1/menu/fetch-menu?field=${params.field}&filter=${params.filter}`;
    }
    return this.http.get(url);
  }

  fetchMenuDetail(slug: any) {
    let url = `${environment.api}/api/v1/menu/fetch-menu-detail?slug=${slug}`;
    return this.http.get(url);
  }
}

