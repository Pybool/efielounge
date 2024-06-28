import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  providers: [
    HttpClientModule,
    AuthService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'efielounge';

  constructor(private authService: AuthService){}

  ngOnInit(){
    const user = this.authService.retrieveUser();
    if(user){
      this.authService.setLoggedIn(true)
    }
    else{
      this.authService.setLoggedIn(false)
      // this.authService.navigateToUrl("/login")
    }
  }
 
}
