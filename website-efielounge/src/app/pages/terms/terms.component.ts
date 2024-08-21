import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
  public accepted: boolean = false;
  public user:any = {}
  @Output() booleanEvent = new EventEmitter<boolean>();

  constructor(private authService: AuthService){}

  ngOnInit(){
    this.user = this.authService.retrieveUser()
  }

  toggleAcceptance(){
    this.accepted = !this.accepted;
  }

  externalClose(event: any) {
    if (event.target.id == 'termsModal') {
      this.sendBoolean(event);
    }
  }

  sendBoolean(event: any, value: boolean = false) {
    this.booleanEvent.emit(value);
  }

  acceptTerms(){
    if(!this.user){
      if(window.localStorage.getItem("efl-t")!== 'seen'){
        window.localStorage.setItem("efl-t", 'seen')
        this.sendBoolean(event);
      }else{
        this.sendBoolean(event);
      }
    }
    this.authService.acceptTerms(this.user?._id).pipe(take(1)).subscribe((response:any)=>{
      if(response.status){
        this.authService.storeUser(response.data);
        this.sendBoolean(event);
      }
    })
  }
}
