import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
} from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';

import {AuthService} from '../../../services/auth.service'
import Swal from 'sweetalert2';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    FormsModule,
    ReactiveFormsModule,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    HttpClientModule
  ],
  providers:[AuthService]
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  public credentials: { email: string; password: string } = {
    email: '',
    password: '',
  };

  login() {
    this.authService
    .login(this.credentials)
    .pipe(take(1))
    .subscribe(
      (response: any) => {
        if (response.status) {
          this.authService.storeTokens(response);
          this.authService.storeUser(response.data);
          this.authService.setLoggedIn(true);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          // if (response.code == 1001) {
          //   const queryParams = { account_id: response.data };
          //   this.router.navigate(['dashboard'], { queryParams });
          // }
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
        console.log(error)
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
}
