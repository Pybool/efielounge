import { CommonModule, DOCUMENT, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
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
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { debounceTime, filter, fromEvent, Subscription, take } from 'rxjs';
import { TransactionService } from '../../../services/transactions.service';



@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
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
    CommonModule,
  ],
  providers: [TransactionService],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {

  public transactions: any[] = [];
  private scrollSubscription: Subscription | undefined;
  public loading: boolean = false;
  public page = 1;
  public pageSize = 10;
  public totalPages = 0;
  public serverUrl = environment.api

  constructor(private transactionService: TransactionService){

  }

  ngOnInit() {
    this.fetchTransactions();
    this.setupScrollEventListener();
  }

  fetchTransactions(fetch:boolean=true) {

    if(fetch){
      this.loading = true;
      this.transactionService
      .fetchTransactions(this.page, this.pageSize)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.totalPages = response.totalPages;
              this.page++;
              response.data.forEach((menu: any) => {
                menu.units = 1;
              });
              this.transactions.push(...response.data);
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            alert('Failed to fetch menu');
          }
        );
    }
    
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);

    // Format the date using Intl.DateTimeFormat
    const options: any = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  setupScrollEventListener() {
    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => {
          const scrollPosition = window.pageYOffset + window.innerHeight;
          const maxScroll = document.documentElement.scrollHeight;
          const threshold = window.innerHeight * 2;
          return !this.loading && maxScroll - scrollPosition < threshold;
        })
      )
      .subscribe(() => {
        if (this.page <= this.totalPages) {
          this.fetchTransactions(true);
        }
      });
  }

}
