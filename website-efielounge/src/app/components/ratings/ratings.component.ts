import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { OrderService } from '../../services/order.service';
import { HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [OrderService],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RatingsComponent {
  @Input() candidate: any;
  @Output() ratingChanged = new EventEmitter<number>();
  selectedRating: number | null = null;
  @Input() menuToRate: any = { name: '' };
  showModal = true;

  constructor(private orderService: OrderService) {}

  toggleRatingsModal() {
    const backdrop: any = document.querySelector('.modal-backdrop');
    const modal: any = document.querySelector('.modal');
    if (backdrop && modal) {
      modal.style.display = 'none';
      backdrop.style.display = 'none';
    }
  }

  showStar(rating: number): void {
    for (let i = 1; i <= rating; i++) {
      const star = document.querySelector(`.rating-star[data-rating='${i}']`);
      star?.classList.remove('fa-star-o');
      star?.classList.add('fa-star');
    }
    for (let i = rating + 1; i <= 5; i++) {
      const star = document.querySelector(`.rating-star[data-rating='${i}']`);
      if (!star?.classList.contains('selected')) {
        star?.classList.remove('fa-star');
        star?.classList.add('fa-star-o');
      }
    }
  }

  mouseEnterStar(event: MouseEvent): void {
    const currentStar = event.currentTarget as HTMLElement;
    const rating = currentStar.dataset['rating']
      ? parseInt(currentStar.dataset['rating'])
      : 0;
    this.showStar(rating);
  }

  mouseLeaveStars(): void {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star) => {
      if (!star.classList.contains('selected')) {
        star.classList.remove('fa-star');
        star.classList.add('fa-star-o');
      }
    });
  }

  starClicked(event: MouseEvent): void {
    console.log('start clicked ', event.target);
    const currentStar = event.currentTarget as HTMLElement;
    const rating = currentStar.dataset['rating']
      ? parseInt(currentStar.dataset['rating'])
      : 0;
    this.selectedRating = rating;

    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star) => {
      star.classList.remove('selected', 'fa-star');
      star.classList.add('fa-star-o');
    });

    for (let i = 1; i <= rating; i++) {
      const star = document.querySelector(`.rating-star[data-rating='${i}']`);
      star?.classList.remove('fa-star-o');
      star?.classList.add('fa-star', 'selected');
    }
  }

  submitCandidateRating(): void {
    if (this.selectedRating && this.selectedRating > 0) {
      console.log(`Submit rating: ${this.selectedRating} stars`);
      // Use a service to submit the rating
      
      this.orderService
        .rateMenu({
          rating: this.selectedRating,
          menu: this.menuToRate?._id,
        })
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.ratingChanged.emit(this.selectedRating!);
              this.showModal = false;
              Swal.fire(response.message);
              this.showModal = true;
              const stars = document.querySelectorAll('.rating-star');
              stars.forEach((star) => {
                star.classList.remove('selected', 'fa-star');
                star.classList.add('fa-star-o');
              });
            }
            this.toggleRatingsModal();
          },
          (error: any) => {
            alert('Something went wrong');
          }
        );
    }
  }
}
