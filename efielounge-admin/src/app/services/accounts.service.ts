import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getCustomers() {
    return this.http.get(
      `${environment.api}/api/v1/admin/accounts/get-customers`
    );
  }

  getStaff() {
    return this.http.get(
      `${environment.api}/api/v1/admin/accounts/get-staff`
    );
  }

  getSingleUser(uid:string){
    return this.http.get(
      `${environment.api}/api/v1/accounts/user-profile?accountId=${uid}`
    );
  }

  saveProfile(uid:string,payload:any){
    return this.http.put(
      `${environment.api}/api/v1/accounts/user-profile?accountId=${uid}`,
      payload
    );
  }
  
}
