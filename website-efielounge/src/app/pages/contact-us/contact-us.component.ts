
import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [PreloaderComponent, HeaderComponent, FooterComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  ngAfterViewInit(){
    const pageLoader = document.querySelector(".loader-container") as HTMLElement;
    setTimeout(()=>{
      pageLoader.style.display = 'none';
    },3000)
  }
}
