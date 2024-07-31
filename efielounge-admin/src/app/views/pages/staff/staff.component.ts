import { CommonModule, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AccountService } from '../../../services/accounts.service';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  GutterDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ModalModule,
  ProgressBarComponent,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { WidgetsDropdownComponent } from 'src/app/views/widgets/widgets-dropdown/widgets-dropdown.component';
import { WidgetsBrandComponent } from 'src/app/views/widgets/widgets-brand/widgets-brand.component';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    HttpClientModule,
    WidgetsDropdownComponent,
    ProgressBarComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
    ReactiveFormsModule,
    ButtonGroupComponent,
    FormCheckLabelDirective,
    ChartjsComponent,
    NgStyle,
    CardFooterComponent,
    GutterDirective,
    ProgressBarDirective,
    ProgressComponent,
    WidgetsBrandComponent,
    CardHeaderComponent,
    TableDirective,
    AvatarComponent,
    ModalModule,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [AccountService, AuthService],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
})
export class StaffComponent {
  public accounts: any[] = [];
  public accountType: string = 'staff';
  public serverUrl: string = environment.api;
  public passwordAgain: string = '';
  public credentials: any = {};
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.filterAccounts();
  }

  filterAccounts() {
    this.accountService
      .getStaff()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response.status) {
          this.accounts = response.data;
          this.accountType = response.accountType;
        }
      });
  }

  register() {
    if (
      this.passwordAgain == this.credentials.password &&
      this.passwordAgain.length >= 8
    ) {
      this.credentials.role = 'ADMIN';
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
                this.router.navigate(
                  [`/account-profile/${queryParams.account_id}`],
                  {
                    queryParams,
                  }
                );
              }, 200);
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
