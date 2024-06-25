import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-remove-from-cart',
  standalone: true,
  imports: [],
  providers: [CartService],
  templateUrl: './remove-from-cart.component.html',
  styleUrl: './remove-from-cart.component.scss',
})
export class RemoveFromCartComponent {
  @Input() removal = { name: 'Item', _id: '' };
  @Output() confirmEvent = new EventEmitter<void>();

  constructor(private cartService: CartService) {}

  toggleRemoveFromCartModal() {
    const confirmationModal = document.querySelector(
      '#confirmationModal'
    ) as any;
    if (confirmationModal) {
      if (confirmationModal.style.display == 'block') {
        confirmationModal.style.display = 'none';
      } else {
        confirmationModal.style.display = 'block';
      }
    }
  }

  confirmRemoval() {
    this.toggleRemoveFromCartModal();
    this.cartService
      .removeFromCart({ cartItemId: this.removal._id })
      .pipe(take(1))
      .subscribe((response: any) => {
        if(response.status){
          this.emitConfirmEvent()
        }
        Swal.fire(response?.message)
      });
  }

  emitConfirmEvent() {
    this.confirmEvent.emit();
  }
}
