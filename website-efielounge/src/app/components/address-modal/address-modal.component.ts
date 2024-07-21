import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './address-modal.component.html',
  styleUrl: './address-modal.component.scss',
})
export class AddressModalComponent {
  public contact: { address: string; phone?: string } = { address: '' };
  @Output() booleanEvent = new EventEmitter<boolean>();
  @Output() newAddressEvent = new EventEmitter<boolean>();


  constructor(private http: HttpClient) {}

  addAddress() {
    this.http
      .post(`${environment.api}/api/v1/accounts/add-address`, this.contact)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.booleanEvent.emit(false);
          this.newAddressEvent.emit(response.data)
          Swal.fire(response?.message);
          
        },
        (error: any) => {
          Swal.fire('Something went wrong');
        }
      );
  }

  externalClose(event: any) {
    if (event.target.id == 'addressModal') {
      this.sendBoolean(event);
    }
  }

  sendBoolean(event: any, value: boolean = false) {
    this.booleanEvent.emit(value);
  }
}
