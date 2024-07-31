import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  standalone: true,  
  imports: [RouterOutlet, HttpClientModule],
  providers: [AuthService],
})
export class AppComponent implements OnInit {
  title = 'Efielounge Admin Panel';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService
  ) {
    this.titleService.setTitle(this.title);
    this.iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

    this.forceLogOut()
  }

  forceLogOut(){
    const status = window.localStorage.getItem("de-auth") as string;
    if(!status || status !== `${document.location.host}-1`){
      this.router.navigate(['/login']);
      window.localStorage.setItem("de-auth", `${document.location.host}-1`)
    }
    
  }
}
