import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {

  serverUrl:string = environment.api

  @Input() images:string[] = [
    "https://archive.org/download/altometa_gmail_E/a.jpg",
    "https://archive.org/download/altometa_gmail_E/b.jpg",
    "https://archive.org/download/altometa_gmail_E/c.jpg",
    "https://archive.org/download/altometa_gmail_E/d.jpg",
    "https://archive.org/download/altometa_gmail_E/e.jpg"
  ]

  @Input() useMaxRes:boolean = true;

}
