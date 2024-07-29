import { Component } from '@angular/core';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

@Component({
  selector: 'app-recover-password',
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
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss',
})
export class RecoverPasswordComponent {
  email: string = '';
  showSpinner:boolean = false

  constructor(private authService: AuthService, private router: Router) {}

  sendRecoveryMail() {
    this.showSpinner = true
    this.authService
      .sendPasswordResetOtp(this.email)
      .pipe(take(1))
      .subscribe((response: any) => {
        if(response.status){
          this.authService.setAccountForReset(this.email)
          this.router.navigate(['/reset-password']);
        }else{
          Swal.fire(response?.message)
        }
        this.showSpinner = false
      },((error:any)=>{
        this.showSpinner = false
        Swal.fire( "Something went wrong")
      }));
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 100);
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
}
