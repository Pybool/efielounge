import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deactivated-account',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    CommonModule,
  ],
  templateUrl: './deactivated-account.component.html',
  styleUrl: './deactivated-account.component.scss'
})
export class DeactivatedAccountComponent {

  ngAfterViewInit(){
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
      document.querySelector('html')?.scrollIntoView();
    }, 2000);
    const body = document.querySelector('body') as any;
    if(body){
      body.style.overflow = 'auto';
      body.style.position = 'unset';
    }
  }

}
