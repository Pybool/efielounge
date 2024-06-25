import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreloaderComponent } from '../../components/preloader/preloader.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload-receipt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './upload-receipt.component.html',
  styleUrl: './upload-receipt.component.scss',
})
export class UploadReceiptComponent {
  selectedFile: File | null = null;
  fileName: string | null = null;
  paymentRef: string = '';
  uploadError: string | null = null;
  activatedRoute$:any;
  autoFilled:boolean = false

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(){
    this.activatedRoute$ = this.route.queryParams.subscribe((params) => { 
      this.paymentRef = params['ref']
      if(this.paymentRef.startsWith('EF')){
        this.autoFilled = true
      }
    })
  }

  ngAfterViewInit() {
    const pageLoader = document.querySelector(
      '.loader-container'
    ) as HTMLElement;
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 3000);
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile!.name;
    this.uploadError = null; // Clear any previous errors
  }

  selectFile() {
    const fileChooser: any = document.querySelector('input[type="file"]'); // Target file input specifically
    fileChooser?.click();
  }

  changeFile() {
    this.selectedFile = null;
    this.fileName = null;
    this.uploadError = null; // Clear any previous errors
  }

  async uploadReceipt() {
    if (!this.selectedFile || !this.paymentRef) {
      this.uploadError = 'Please select a file and enter your payment ref.';
      return;
    }

    const formData = new FormData();
    formData.append('attachments', this.selectedFile);
    formData.append('ref', this.paymentRef);

    try {
      this.http
        .post<any>(
          `${environment.api}/api/v1/cart/upload-receipt`, // Replace with your actual upload endpoint
          formData
        )
        .pipe(take(1))
        .subscribe((response: any) => {
          // Handle successful upload response (e.g., display success message)
          console.log('Upload successful:', response);
          Swal.fire(response?.message)
          this.selectedFile = null;
          this.fileName = null;
          this.paymentRef = '';
        });
    } catch (error) {
      console.error('Upload error:', error);
      this.uploadError = 'An error occurred during upload. Please try again.';
    }
  }
}
