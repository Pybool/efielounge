import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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
    CommonModule
  ],
  providers: [AuthService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  public email: string = '';
  public password: string = '';
  public passwordAgain: string = '';
  public showSpinner:boolean = false;

  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
  }

  resetPassword() {
    this.showSpinner = true
    this.authService
      .resetPassword({ email: this.email, password: this.password })
      .pipe(take(1))
      .subscribe((response: any) => {
        console.log(response)
        this.showSpinner = false;
      });
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

  enabled(){
    if(this.password == "" || this.passwordAgain == ""){
      return true
    }
    console.log(this.password != this.passwordAgain , this.isInvalidEmail())
    return (this.password != this.passwordAgain) && !this.isInvalidEmail()
  }
}
