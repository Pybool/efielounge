import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    public tokenService: TokenService,
    public router: Router
  ) {}
  canActivate(): boolean {
    if (
      !this.tokenService.retrieveToken('efielounge-admin-accessToken') ||
      !this.tokenService.retrieveUser()
    ) {
      this.router.navigateByUrl('/login');
      return true; //change back to false
    }
    return true;
  }
}


