import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [PreloaderComponent, HeaderComponent, FooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  ngAfterViewInit(){
    const pageLoader = document.querySelector(".loader-container") as HTMLElement;
    setTimeout(()=>{
      pageLoader.style.display = 'none';
    },300)
  }
}
