import { Component } from '@angular/core';
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
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/


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
    CommonModule
  ],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  public showSpinner = false;
  public passwordAgain = '';
  public credentials: any = {};

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 3000);
  }

  register() {
    // if (!this.accepted || this.isPasswordMatch() || this.isInvalidEmail(this.credentials)) {
    //   return null;
    // }
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

  isInvalidEmail() {
    try {
      if (this.credentials.email.trim().length > 0) {
        if (!emailRegex.test(this.credentials.email)) {
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

  enabled(){
    if(this.credentials.password == "" || this.passwordAgain == ""){
      return true
    }
    console.log(this.credentials.password != this.passwordAgain , this.isInvalidEmail())
    return (this.credentials.password != this.passwordAgain) && !this.isInvalidEmail()
  }
}
