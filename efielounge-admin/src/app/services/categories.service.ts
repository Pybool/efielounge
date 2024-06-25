import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  createCategory(payload: { name: string }) {
    return this.http.post(
      `${environment.api}/api/v1/admin/menu/create-menu-category`,
      payload
    );
  }

  fetchCategories() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menu-categories`
    );
  }

  createMenuItemCategory(payload: { name: string }) {
    return this.http.post(
      `${environment.api}/api/v1/admin/menu/create-menu-item-category`,
      payload
    );
  }

  fetchMenuItemCategories() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menuitem-categories`
    );
  }

  createMenuItem(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/admin/menu/create-menu-item`,
      payload
    );
  }

  fetchMenuItems() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menu-item`
    );
  }

  createMenu(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/admin/menu/create-menu`,
      payload
    );
  }

  fetchMenu() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menu`
    );
  }
  
}
