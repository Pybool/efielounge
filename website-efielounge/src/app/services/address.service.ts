import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, take } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  public addresses: any = [];
  public addressId: string = '';
  public addressesSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  constructor(private http: HttpClient, private router: Router) {
    // this.
  }

  setAddresses(addresses: any[]) {
    this.addresses = addresses
    this.addresses.sort(
        (a: { isDefault: any }, b: { isDefault: any }) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return 0;
        }
      );
    this.addressesSubject.next(this.addresses);
  }

  getAddressesObs() {
    this.getAddresses()
      .pipe(take(1))
      .subscribe((response: any) => {
        this.setAddresses(response.data);
      });
    return this.addressesSubject.asObservable();
  }

  setDefaultAddressReq(payload: { addressId: string }) {
    return this.http.post(
      `${environment.api}/api/v1/accounts/set-default-address`,
      payload
    );
  }

  setDefaultAddress(address: any) {
    this.addressId = address._id;
    this.setDefaultAddressReq({ addressId: address._id })
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          for (let _address of this.addresses) {
            _address.isDefault = false;
          }
          address.isDefault = true;
          this.addresses.sort(
            (a: { isDefault: any }, b: { isDefault: any }) => {
              if (a.isDefault && !b.isDefault) return -1;
              if (!a.isDefault && b.isDefault) return 1;
              return 0;
            }
          );
          this.setAddresses(this.addresses);
        }
      });
  }

  deleteObjectById(arr: any, id: string) {
    const index = arr.findIndex((obj: { _id: string }) => obj._id === id);

    if (index !== -1) {
      arr.splice(index, 1); // Remove the object at the found index
      return true;
    } else {
      return false;
    }
  }

  getAddresses() {
    return this.http.get(`${environment.api}/api/v1/accounts/get-addresses`);
  }

  removeAddressReq(payload: { addressId: string }) {
    return this.http.post(
      `${environment.api}/api/v1/accounts/remove-address`,
      payload
    );
  }

  removeAddress(addressId: string) {
    this.removeAddressReq({ addressId })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          Swal.fire(response.message);
          if (response.data) {
            console.log("Before delete ", this.addresses, response.data._id)
            this.deleteObjectById(this.addresses, response.data._id);
            console.log("After delete ", this.addresses)
            this.setAddresses(this.addresses);
          }
        },
        (error: any) => {
          alert(error.message);
        }
      );
  }
}
