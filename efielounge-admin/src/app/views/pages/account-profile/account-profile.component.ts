
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-profile',
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
  providers:[AccountService],
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss'
})
export class AccountProfileComponent implements OnDestroy {
  public uid:string = ""
  public activatedRoute$:any;
  public user:any = {}
  public editText:string = 'Edit'
  public isReadOnly:boolean = true;
  public attachments: FileList | null = null;
  public serverUrl = environment.api;
  public staff:any = JSON.parse(window.localStorage.getItem("user")!) as any

  constructor(private route: ActivatedRoute, private accountService: AccountService){}

  ngOnInit(){
    this.activatedRoute$ = this.route.paramMap.subscribe(params => {
      this.uid = params.get('uid') as string;

      this.accountService
      .getSingleUser(this.uid)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.user = response.data
          }
        },
        (error: any) => {
          alert('Failed to fetch user');
        }
      );
    });
  }

  edit(){
    this.isReadOnly = !this.isReadOnly;
    if(this.isReadOnly){
      this.editText = 'Edit'
    }else{
      this.editText = 'Cancel'
    }
    const inputs = document.querySelectorAll('input') as any;
    inputs.forEach((input:any)=>{
      input.classList.toggle("edit-false")
    })

    const inputsGroupTexts = document.querySelectorAll('span.edit-false') as any;
    inputsGroupTexts.forEach((input:any)=>{
      input.classList.toggle("edit-false")
    })
  }

  onFileChange(event: any): void {
    this.attachments = event.target.files;
  }

  chooseAvatar(){
    const avatarFile = document.querySelector(".avatar-file") as any;
    avatarFile?.click()
  }

  saveProfile(){
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.user));
    if(this.attachments){
      const firstFile = this.attachments![0];
      formData.append('attachments', firstFile);
    }
    
    this.accountService.saveProfile(this.uid, formData).pipe(take(1)).subscribe((response:any)=>{
      if(response.status){
        this.user = response.data
      }
      Swal.fire(response.message)
    },((error:any)=>{
      alert("Something went wrong")
    }))
  }

  ngOnDestroy(){
    this.activatedRoute$?.unsubscribe()
  }
}