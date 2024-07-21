import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import {
  faLock,
  faShield,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-otp-authorize',
  templateUrl: './otp-authorize.component.html',
  styleUrls: ['./otp-authorize.component.css'],
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    HttpClientModule,
    FormsModule,
    OtpInputComponent,
    FontAwesomeModule,
  ],
  providers: [ AuthService, SharedService],
})
export class OtpAuthorizeComponent implements OnInit, OnDestroy {
  data = '';
  email: any = null;
  showSpinner: boolean = false;
  showOtpSpinner: boolean = false;
  pinVerificationMsg: any = null;
  faShield = faShield;
  faLock = faLock;
  faExclamationTriangle = faExclamationTriangle;
  otpText: string = 'Resend Otp Code';
  timeLeft: number = 30;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.email = localStorage.getItem(params['account_id']);
      if(!params || !this.email){
        return this.router.navigate(['register'])
      }
      return null;
    });
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  // ngAfterViewInit() {
  //   const body = document.querySelector('body') as any;
  //   body.style.background = 'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)!important;'
  // }

  submit() {
    // this.router.navigate(['loading']);
    const data = { otp: this.data, email: this.email };
    this.authService
      .verifyAccount(data)
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          Swal.fire({
            title: 'Account Verification',
            text: response?.message,
            timer: 2000,
          }).then(() => {
            this.router.navigate(['login']);
          });
        } else {
          Swal.fire({
            title: 'Account Verification',
            text: response?.message,
            timer: 2000,
          });
        }
      });
  }

  resendOtp() {
    const otpLinkTextEl = document.querySelector(
      '.otp-link-text'
    ) as HTMLElement;
    otpLinkTextEl.style.color = 'gray';
    otpLinkTextEl.style.pointerEvents = 'none';
    otpLinkTextEl.setAttribute('disabled', 'true');
    this.showOtpSpinner = true;
    this.authService
      .resendOtp({ email: this.email })
      .pipe(take(1))
      .subscribe((response: any) => {
        this.showOtpSpinner = false;
        if(response.status){
          this.data = '';
          this.countDownOtp();
        }
        else{
          otpLinkTextEl.style.color = 'steelblue';
          otpLinkTextEl.style.pointerEvents = 'auto';
        }
      }, ((error)=>{
        this.showOtpSpinner = false;
        otpLinkTextEl.style.color = 'steelblue';
        otpLinkTextEl.style.pointerEvents = 'auto';
      }));
  }

  countDownOtp() {
    const intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1; // Concise decrement
        this.otpText = `Resend code in ${this.timeLeft} seconds`;
      } else {
        const otpLinkTextEl = document.querySelector(
          '.otp-link-text'
        ) as HTMLElement;
        otpLinkTextEl.style.color = 'steelblue';
        otpLinkTextEl.style.pointerEvents = 'auto';
        this.otpText = `Resend code`;
        otpLinkTextEl.setAttribute('disabled', 'false');
        clearInterval(intervalId);
        this.timeLeft = 30;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Disconnect from WebSocket when the component is destroyed
    // this.webSocketService.disconnect();
  }
}
