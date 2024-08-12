import { Component, Input, SimpleChanges } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import Swal from 'sweetalert2';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { countryCodes } from '../../services/countrycodes';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { CountrySelectComponent } from '../../components/country-select/country-select.component';
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    OtpInputComponent,
    CountrySelectComponent,
  ],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  public showSpinner = false;
  public passwordAgain = '';
  public credentials: any = {};
  data: any = '';
  showOtp: boolean = false;
  authenticationMethod: string = 'mobile';
  phone: string = '535845810';
  disable: boolean = true;
  activeSendOtp = true;
  showSubmit: boolean = false;
  timeLeft: any;
  otpText: string = 'Resend Code';
  called = false;
  hasRequestedOtpEarlier = false
  showResendSpinner = false
  selectedCountry: { name: string; dial_code: string; code: string } = {
    name: 'Ghana',
    dial_code: '+233',
    code: 'GH',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onDataChange(newValue: string, type: string = 'phone') {
    this.data = newValue;
    if (newValue.length === 4) {
      this.disable = false
      if (!this.called) {
        this.callFunction(type);
        this.called = true;
      }
    }
  }

  callFunction(type:string) {
    if (type === 'phone') {
      this.phoneNumberRegister();
    } else {
      this.emailRegister();
    }
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
    this.isInvalidEmail();
  }

  handleCountrySelected($event: any) {
    this.selectedCountry = $event;
    this.isValidPhone();
  }

  register() {
    this.showSpinner = true;
    if (
      this.passwordAgain == this.credentials.password &&
      this.passwordAgain.length >= 8
    ) {
      this.authService
        .register(this.credentials)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            this.showSpinner = false;
            if (response?.status) {
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `Register Success!`,
                text: response.message,
                showConfirmButton: false,
                timer: 1500,
              });

              setTimeout(() => {
                const queryParams = { account_id: response.data };
                localStorage.setItem(response.data, this.credentials.email);
                this.router.navigate(['/account-verification'], {
                  queryParams,
                });
              }, 2000);
            } else {
              Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: `Registration failed!`,
                text: response.message,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          },
          (error: any) => {
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: `Registration Failed`,
              text: 'Something went wrong',
              showConfirmButton: false,
              timer: 1500,
            });
          }
        );
    } else {
      this.showSpinner = false;
      alert('Invalid password/ Non matching password');
    }
    return null;
  }
  
  phoneNumberSendOtp(resend:boolean=false, otpLinkTextEl:any = null) {
    this.authService
      .phoneNumberSendOtp({ phone: this.phone, messageType: 'REGISTER' })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          console.log(response);
          this.hasRequestedOtpEarlier = true;
          if (response.status) {
            this.showSubmit = true;
            if(response?.testotp){
              alert(`Welocme to Efielounge your otp is ${response.testotp}. \nPlease do not share this code with anyone.`)
            }
          } else {
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: `Otp Error`,
              text: response?.message,
              showConfirmButton: false,
              timer: 1500,
            });
            if(resend){
              if(otpLinkTextEl){
                otpLinkTextEl.style.color = 'orange';
                otpLinkTextEl.style.pointerEvents = 'auto';
              }
                         
            }
          }
          this.showResendSpinner = false;
          this.countDownOtp();
        },
        (error: any) => {
          this.countDownOtp();
          this.showResendSpinner = false;
          this.showSpinner = false;
          this.hasRequestedOtpEarlier = true
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: `OTP Error`,
            text: "Something went wrong",
            showConfirmButton: false,
            timer: 1500,
          });
          if(resend){
            if(otpLinkTextEl){
              otpLinkTextEl.style.color = 'orange';
              otpLinkTextEl.style.pointerEvents = 'auto';
            }
            
          }
        }
      );
  }

  emailSendOtp(resend: boolean = false, otpLinkTextEl: any = null) {
    if (resend) {
      this.showResendSpinner = true;
    }
    this.authService
      .emailSendOtp({ email: this.credentials.email, messageType: 'REGISTER' })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.hasRequestedOtpEarlier = true;
          if (response.status) {
            this.showSubmit = true;
            
          } else {
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: `Otp Error`,
              text: response?.message,
              showConfirmButton: false,
              timer: 1500,
            });
            if (resend) {
              if (otpLinkTextEl) {
                otpLinkTextEl.style.color = 'orange';
                otpLinkTextEl.style.pointerEvents = 'auto';
              }
            }
          }
          this.countDownOtp();
          this.showResendSpinner = false;
        },
        (error: any) => {
          this.countDownOtp();
          this.showResendSpinner = false;
          this.showSpinner = false;
          this.hasRequestedOtpEarlier = true;
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: `OTP Error`,
            text: "Something went wrong",
            showConfirmButton: false,
            timer: 1500,
          });
          if (resend) {
            if (otpLinkTextEl) {
              otpLinkTextEl.style.color = 'orange';
              otpLinkTextEl.style.pointerEvents = 'auto';
            }
          }
        }
      );
  }

  phoneNumberRegister() {
    this.showSpinner = true;
    this.authService
      .phoneNumberRegistration({
        phone: this.phone,
        otp: this.data,
        dialCode: this.selectedCountry.dial_code,
        countryCode: this.selectedCountry.code,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          console.log(response);
          if (response.status) {
            this.showSpinner = false;

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: `Register Success!`,
              text: response?.message || 'Registration was successfull',
              showConfirmButton: false,
              timer: 1500,
            });
            this.router.navigate(['/login']);
          } else {
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: `Login eror`,
              text: response?.message,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        },
        (error: any) => {
          this.showSpinner = false;
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: `Login eror`,
            text: "Something went wrong",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      );
  }

  emailRegister() {
    this.showSpinner = true;
    this.authService
      .emailRegister({ email: this.credentials.email, otp: this.data })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          console.log(response);
          if (response.status) {
            this.showSpinner = false;

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: `Register Success!`,
              text: response?.message || 'Registration was successfull',
              showConfirmButton: false,
              timer: 1500,
            });
            this.router.navigate(['/login']);
          } else {
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: `Login eror`,
              text: response?.message,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        },
        (error: any) => {
          this.showSpinner = false;
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: `Login eror`,
            text: "Something went wrong",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      );
  }

  isValidPhone($event: any = null) {
    const isValidPhone = this.authService.validatePhoneNumber(
      `${this.selectedCountry.dial_code}${this.phone}`,
      this.selectedCountry.code
    );
    this.disable = !isValidPhone;
  }

  isInvalidEmail() {
    try {
      if (this.credentials.email.trim().length > 0) {
        if (!emailRegex.test(this.credentials.email)) {
          return true;
        } else {
          return false;
        }
      }
      this.activeSendOtp = true;
      return true;
    } catch {
      return false;
    }
  }

  enabled() {
    if (this.credentials.password == '' || this.passwordAgain == '') {
      return true;
    }
    return (
      this.credentials.password != this.passwordAgain && !this.isInvalidEmail()
    );
  }

  checkValidmail() {
    this.enableSendOtpButton();
  }

  enableSendOtpButton() {
    this.activeSendOtp = this.isInvalidEmail();
    console.log('this.activeSendOtp ', this.activeSendOtp);
  }

  resendCode(){
    this.data = ""
    const otpLinkTextEl = document.querySelector(
      '.otp-link-text'
    ) as HTMLElement;
    otpLinkTextEl.style.color = 'gray';
    otpLinkTextEl.style.pointerEvents = 'none';
    otpLinkTextEl.setAttribute('disabled', 'true');
    this.showResendSpinner = true;
    this.phoneNumberSendOtp(true, otpLinkTextEl)    
  }

  countDownOtp() {
    const intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1; // Concise decrement
        this.otpText = `Resend Code in ${this.timeLeft} seconds`;
      } else {
        const otpLinkTextEl = document.querySelector(
          '.otp-link-text'
        ) as HTMLElement;
        otpLinkTextEl.style.color = 'orange';
        otpLinkTextEl.style.pointerEvents = 'auto';
        this.otpText = `Resend Code`;
        otpLinkTextEl.setAttribute('disabled', 'false');
        clearInterval(intervalId);
        this.timeLeft = 3;
      }
    }, 1000);
  }
}
