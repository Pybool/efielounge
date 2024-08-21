import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  @Output() booleanEvent = new EventEmitter<boolean>();

  externalClose(event: any) {
    if (event.target.id == 'privacyModal') {
      this.togglePrivacyPolicy()
    }
  }

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

  sendBoolean(event: any, value: boolean = false) {
    this.booleanEvent.emit(value);
  }

  showCookiePolicy(){
    const banner = document.querySelector('.base-cookie-banner') as any;
    if (banner) {
      banner.style.display = 'flex';
    }
  }
}
