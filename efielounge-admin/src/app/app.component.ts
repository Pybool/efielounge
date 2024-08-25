import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';
import { HttpClientModule } from '@angular/common/http';
// import { Howl } from 'howler';
var self:any;
@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  standalone: true,  
  imports: [RouterOutlet, HttpClientModule],
  providers: [AuthService, SocketService],
})
export class AppComponent implements OnInit {
  title = 'Efielounge Admin Panel';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private socketService: SocketService
  ) {
    self = this
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

  ngAfterViewInit(){
    Notification.requestPermission().then(function(permission){
      if(permission === "granted"){
        self.socketService.connectToSocket()
      }
    })
  }

  forceLogOut(){
    const status = window.localStorage.getItem("de-auth") as string;
    if(!status || status !== `${document.location.host}-1`){
      this.router.navigate(['/login']);
      window.localStorage.setItem("de-auth", `${document.location.host}-1`)
    }
    
  }
}
