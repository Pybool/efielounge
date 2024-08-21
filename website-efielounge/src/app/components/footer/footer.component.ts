import { Component, EventEmitter, Output } from '@angular/core';
import { TermsComponent } from '../../pages/terms/terms.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TermsComponent, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  public forceShowterms = false;

  togglePrivacyPolicy(){
    const privacyModal = document.querySelector(".privacy-modal") as any;
    console.log("privacyModal.style.display ", privacyModal.style.display)
    if(privacyModal){
      if(privacyModal.style.display==='none' || privacyModal.style.display === ""){
        privacyModal.style.display = 'block';
      }else{
        privacyModal.style.display= 'none';
      }
    }
  }

  showCookiePolicy(){
    const banner = document.querySelector('.base-cookie-banner') as any;
    if (banner) {
      banner.style.display = 'flex';
    }
  }

  showTerms(){
    this.forceShowterms = !this.forceShowterms
  }

  handleTermsBooleanEvent(value:boolean,){
    this.forceShowterms =  value;
  }

}
