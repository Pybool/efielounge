import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [PreloaderComponent, HeaderComponent, FooterComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {

  ngAfterViewInit(){
    const pageLoader = document.querySelector(".loader-container") as HTMLElement;
    setTimeout(()=>{
      pageLoader.style.display = 'none';
    },3000)
  }
}
