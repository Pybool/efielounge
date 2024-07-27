import { Component } from '@angular/core';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { ClientSiteService } from '../../../services/clientSiteService.service';
import { CommonModule } from '@angular/common';
import {
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ModalModule,
} from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { idText } from 'typescript';

interface Ipromotion {
  _id?: string;
  description?: string;
  attachments?: { type: string; url: string }[];
  isActive?: boolean;
}

@Component({
  selector: 'app-client-site-homepage',
  standalone: true,
  imports: [
    CommonModule,
    InputGroupComponent,
    HttpClientModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule,
    InputGroupComponent,
    InputGroupTextDirective,
    FormDirective,
    FormControlDirective,
  ],
  providers: [ClientSiteService],
  templateUrl: './client-site-homepage.component.html',
  styleUrl: './client-site-homepage.component.scss',
})
export class ClientSiteHomepageComponent {
  public home: any = {};
  public banner: string = '';
  public attachments: FileList | null = null;
  public promotion: Ipromotion = {};
  public serverUrl: string = environment.api
  public promotions: Ipromotion[] = [
    // {
    //   description:
    //     'Welcome to our food tasting fiesta, live at Efielounge, Anyaa, Ghana. Come one Come All!!',
    //   attachments: [
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/IMG-20240727-WA0001.jpg',
    //     },
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/banner2.jpg',
    //     },
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/banner3.jpg',
    //     },
    //   ],
    //   isActive: false,
    // },
    // {
    //   description:
    //     'Christmas is here again!, live at Efielounge, Anyaa, Ghana. Come one Come All!!',
    //   attachments: [
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/IMG-20240727-WA0001.jpg',
    //     },
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/banner2.jpg',
    //     },
    //     {
    //       type: 'image',
    //       url: '/assets/efielounge/banner3.jpg',
    //     },
    //   ],
    //   isActive: true,
    // },
  ];

  constructor(private clientSiteService: ClientSiteService) {}

  ngOnInit() {
    this.clientSiteService
      .getClientHome()
      .pipe(take(1))
      .subscribe((response: any) => {
        if(response.status){
          this.home = response.home;
          this.promotions = response.promotions
        }
        if (this.home?.banner) {
          this.banner =
            environment.api +
            this.home?.banner
              .replace('/public', '')
              .replace('/efielounge-backend', '');
        }
      });
  }

  onFileChange(event: any): void {
    this.attachments = event.target.files;
  }

  private getObjectById(array: any, id: string | undefined) {
    return array.find((item: { _id: string }) => item._id === id);
  }

  // private to remove an object by _id
  private removeObjectById(array: any, id: string | undefined) {
    const index = array.findIndex((item: { _id: string }) => item._id === id);
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  }

  async createPromotion(): Promise<void> {
    if (this.attachments) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(this.promotion));
      for (let i = 0; i < this.attachments.length; i++) {
        formData.append('attachments', this.attachments[i]);
      }

      this.clientSiteService
        .createPromotion(formData)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            Swal.fire(response.message);
            if (response.status) {
              this.promotions.unshift(response.data);
            }
          },
          (error: any) => {
            alert('Something went wrong');
          }
        );
    }
    else{
      alert("Please select some images")
    }
  }

  activatePromotion(_id: string | undefined, isActive: boolean = false) {
    const payload = { _id: _id, isActive };
    this.clientSiteService
      .activatePromotion(payload)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          Swal.fire(response.message);
          if (response.status) {
            const objectForUpdate = this.getObjectById(this.promotions, _id);
            objectForUpdate.isActive = isActive;
          }
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }

  deletePromotion(_id: string | undefined) {
    const payload = { _id: _id };
    this.clientSiteService
      .deletePromotion(payload)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          Swal.fire(response.message);
          if (response.status) {
            this.promotions = this.removeObjectById(this.promotions, _id);
          }
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }

  chooseBackground() {
    const avatarFile = document.querySelector('.avatar-file') as any;
    avatarFile?.click();
  }

  saveBackground() {
    const formData = new FormData();
    if (this.attachments) {
      const firstFile = this.attachments![0];
      formData.append('attachments', firstFile);
    }

    this.clientSiteService
      .changeBanner(formData)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response.status) {
            this.banner =
              environment.api +
              response?.banner
                .replace('/public', '')
                .replace('/efielounge-backend', '');
          }
          Swal.fire(response.message);
        },
        (error: any) => {
          alert('Something went wrong');
        }
      );
  }
}
