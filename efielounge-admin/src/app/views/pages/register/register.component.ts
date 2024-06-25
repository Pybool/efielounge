import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers:[AuthService],
})
export class RegisterComponent {
  public passwordAgain:string = ""
  public credentials:any = {}
  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (
      this.passwordAgain == this.credentials.password &&
      this.passwordAgain.length >= 8
    ) {
      this.credentials.role = "STAFF"
      this.authService
        .register(this.credentials)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
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
      alert('Invalid password/ Non matching password');
    }
    return null;
  }

  isInvalidEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
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
}
