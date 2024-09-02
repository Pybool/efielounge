import { Component, EventEmitter, Output } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-list.component.html',
  styleUrl: './address-list.component.scss'
})
export class AddressListComponent {
  public addressId:string = ""
  public addresses: any[] = []
  @Output() booleanEvent = new EventEmitter<boolean>();
  @Output() selectedDeliveryAddress = new EventEmitter<any>();

  constructor(private addressService: AddressService){
    
  }

  ngOnInit(){
    this.addressService.getAddressesObs().subscribe((addresses:any)=>{
      this.addresses = addresses
    })
  }

  setDefaultAddress(address: any) {
    this.addressService.setDefaultAddress(address)
    this.selectedDeliveryAddress.emit(address)
  }

  removeAddress(addressId: string) {
    const confirmation = confirm(
      'Are you sure you want to delete this address?'
    );
    if (confirmation) {
      this.addressService.removeAddress( addressId )
    }
  }

  externalClose($event:any){
    if ($event.target.id == 'addressesModal') {
      this.booleanEvent.emit(false)
    }

  }

  toggleAddressesModal(){
    const addressesModal = document.querySelector('#addressesModal') as any;
    if (addressesModal) {
      if (addressesModal.style.display == 'block') {
        addressesModal.style.display = 'none';
      } else {
        addressesModal.style.display = 'block';
      }
    }
  }
}
