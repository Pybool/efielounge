import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PreloaderComponent, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  ngAfterViewInit(){
    const pageLoader = document.querySelector(".loader-container") as HTMLElement;
    setTimeout(()=>{
      pageLoader.style.display = 'none';
    },3000)
  }
}
