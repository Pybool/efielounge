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

  editMenuCategory(payload: {_id:string; name: string }) {
    return this.http.put(
      `${environment.api}/api/v1/admin/menu/edit-menu-category`,
      payload
    );
  }

  archiveMenuCategory(payload: { _id: string; archive: number }) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/menu/archive-menu-category`,
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

  editMenuItemCategory(payload: any) {
    return this.http.put(
      `${environment.api}/api/v1/admin/menu/edit-menu-item-category`,
      payload
    );
  }

  archiveMenuItemCategory(payload: { _id: string; archive: number }) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/menu/archive-menu-item-category`,
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

  editMenuItem(payload: any) {
    return this.http.put(
      `${environment.api}/api/v1/admin/menu/edit-menu-item`,
      payload
    );
  }

  archiveMenuItem(payload: { _id: string; archive: number }) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/menu/archive-menu-item`,
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

  editMenu(payload: any) {
    return this.http.put(
      `${environment.api}/api/v1/admin/menu/edit-menu`,
      payload
    );
  }

  archiveMenu(payload: { _id: string; archive: number }) {
    return this.http.patch(
      `${environment.api}/api/v1/admin/menu/archive-menu`,
      payload
    );
  }

  fetchMenu() {
    return this.http.get(
      `${environment.api}/api/v1/menu/fetch-menu`
    );
  }
  
}
