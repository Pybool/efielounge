import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
  ],
  providers: [AuthService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  public otp: string = '';
  public email: string = '';
  public password: string = '';
  public passwordAgain: string = '';
  public showSpinner: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  resetPassword() {
    this.showSpinner = true;
    this.authService
      .resetPassword({
        email: this.authService.getAccountForReset(),
        password: this.password,
        otp: this.otp,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.showSpinner = false;
          if (response.status) {
            this.authService.navigateToUrl('/login');
          } else {
            Swal.fire(response?.message || 'Password reset failed');
          }
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }

  sendRecoveryMail() {
    this.showSpinner = true;
    this.authService
      .sendPasswordResetOtp(this.authService.getAccountForReset())
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          console.log(response);
          if (response.status) {
            this.authService.setAccountForReset(
              this.authService.getAccountForReset()
            );
            Swal.fire("OTP code has been resent")

          } else {
            Swal.fire(response?.message);
          }
          this.showSpinner = false;
        },
        (error: any) => {
          this.showSpinner = false;
          Swal.fire('Something went wrong');
        }
      );
  }

  isInvalidEmail() {
    try {
      if (this.email.trim().length > 0) {
        if (!emailRegex.test(this.email)) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  enabled() {
    if (this.password == '' || this.passwordAgain == '') {
      return true;
    }
    return this.password != this.passwordAgain && !this.isInvalidEmail();
  }
}
