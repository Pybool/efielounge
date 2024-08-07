import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

var self: any;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern =
  /^(?=.*[A-Z].*[A-Z])(?=.*[a-z].*[a-z].*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9].*[0-9]).{8,}$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  activeTab: string = 'signin';
  passwordAgain: string = '';
  accepted = false;
  opacity = 0.5;
  pointerType = 'none';
  showtermsAndConditions = false;
  showSpinner = false;
  showRegSpinner = false;
  isDirtyPassword = false;
  isDirtyEmail = false;
  activeLogin = false;
  credentials: { email: string; password: string } = {
    email: '',
    password: '',
  };
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    self = this;
  }

  ngOnInit() {
   
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    document.location.hash = `#${tab}`;
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  moveBackground(event: MouseEvent): void {
    const amountMovedX = (event.pageX * -1) / 30;
    const amountMovedY = (event.pageY * -1) / 9;
    const backgroundPosition = `${amountMovedX}px ${amountMovedY}px`;

    // Use Angular Renderer to modify DOM properties
    const bgElement = document.querySelector('.container .bg') as HTMLElement;
    bgElement.style.backgroundPosition = backgroundPosition;
  }



  login() {
    this.showSpinner = true;
    this.authService
      .login(this.credentials)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.showSpinner = false;
            this.authService.storeTokens(response);
            this.authService.storeUser(response.data);
            this.authService.setLoggedIn(true);
            setTimeout(() => {
              const urlParams = new URLSearchParams(window.location.search);
              const returnUrl = urlParams.get('next');
              if (returnUrl) {
                window.location.href = decodeURIComponent(returnUrl);
              } else {
                window.location.href = '/'; // Default to home page
              }
            }, 500);
          } else {
            if (response.code == 1001) {
              const queryParams = { account_id: response.data };
              this.router.navigate(['account-verification'], { queryParams });
            }
            this.showSpinner = false;
            Swal.fire({
              position: 'top-end',
              icon: 'warning',
              title: `Login Failed`,
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
            title: `Login eror`,
            text: 'Something went wrong',
            showConfirmButton: false,
            timer: 1500,
          });
        }
      );
  }

  // requirederrors(field: string) {
  //   try {
  //     if (this.credentials[field].length == 0) {
  //       return true;
  //     }
  //     return false;
  //   } catch (err) {
  //     return false;
  //   }
  // }

  isInvalidEmail(credentials: any) {
    try {
      if (credentials.email.trim().length > 0) {
        if (!emailRegex.test(credentials.email)) {
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

  isInvalidPassword() {
    try {
      if (this.credentials.password.trim().length > 0) {
        if (!passwordPattern.test(this.credentials.password)) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  enableLoginButton() {
    this.activeLogin =
      this.credentials.password.trim() != '' &&
      !this.isInvalidEmail(this.credentials);
  }

  isPasswordMatch() {
    if (this.passwordAgain.trim() == '' && this.isDirtyPassword) {
      return true;
    }
    try {
      if (this.passwordAgain != this.credentials.password) {
        this.accepted = false;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  dirtyEmail(credentials: any) {
    if (!this.isDirtyEmail) this.isDirtyEmail = true;
    if (
      this.accepted &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(credentials)
    ) {
      this.opacity = 1;
      this.pointerType = 'pointer';
      return;
    }
    this.opacity = 0.5;
    this.pointerType = 'none';
    //
    this.enableLoginButton();
  }

  dirtyPassword() {
    if (!this.isDirtyPassword) this.isDirtyPassword = true;
    if (
      this.accepted &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(this.credentials)
    ) {
      this.opacity = 1;
      this.pointerType = 'pointer';
      return;
    }
    this.opacity = 0.5;
    this.pointerType = 'none';
  }
}
