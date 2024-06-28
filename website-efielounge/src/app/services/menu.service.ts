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
    if (
      Object.keys(params).includes('status') &&
      Object.keys(params).includes('limit')
    ) {
      url = `${environment.api}/api/v1/menu/fetch-menu?field=status&filter=${params.status}&limit=${params.limit}`;
    }
    return this.http.get(url);
  }

  fetchMenuDetail(slug: any) {
    let url = `${environment.api}/api/v1/menu/fetch-menu-detail?slug=${slug}`;
    return this.http.get(url);
  }

  fetchUserFavouriteMenu() {
    let url = `${environment.api}/api/v1/menu/get-user-favourites`;
    return this.http.get(url);
  }

  fetchMostPopularMenu() {
    let url = `${environment.api}/api/v1/menu/get-most-popular-menu`;
    return this.http.get(url);
  }

  async likeMenu(_id:string, token:string) {
    const url = `${environment.api}/api/v1/menu/like-menu`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ _id })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong!');
    }
    const data = await response.json();
    return data;
  }
  

  
}

