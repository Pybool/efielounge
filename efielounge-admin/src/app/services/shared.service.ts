// shared.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, take } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private componentStateSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);

  private navSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private router: Router, private http: HttpClient) {}

  toggleComponent(route: string) {
    this.router.navigate([route]);
  }

  setActiveComponentState(componentState: any): void {
    this.componentStateSubject.next(componentState);
  }

  getActiveComponent(): Observable<any> {
    return this.componentStateSubject.asObservable();
  }

  // Add the following TypeScript code to your component
  setToggleNavState(status: string) {
    if (status == 'show') {
      this.navSubject.next(true);
    } else {
      this.navSubject.next(false);
    }
  }

  getToggleNavState(): Observable<any> {
    return this.navSubject.asObservable();
  }

  setActiveNavItem(navItemClass: string) {
    setTimeout(() => {
      const navItem = Array.from(
        document.getElementsByClassName(navItemClass)
      ) as any;
      if (navItem) {
        const navItems = Array.from(
          document.getElementsByClassName('nav-item')
        ) as any;
        navItems.forEach((navItem: any) => {
          navItem.style.borderBottom =
            '0px ' + getComputedStyle(document.body).getPropertyValue('#ffff');
        });
        try {
          const navIcons = Array.from(
            document.getElementsByClassName('nav-icon')
          ) as any;
          navIcons.forEach((navIcon:any)=>{
            navIcon.classList.add('hover');
          })
          const item: any = Array.from(navItem)[0];
          const activeLink = item.children[0] as any;
          activeLink.classList.remove('hover');
        } catch {}
        const selectedNavItem = navItem[0];
        selectedNavItem.style.borderBottom =
          '2px solid ' +
            getComputedStyle(document.body).getPropertyValue(
              '--Button-Primary-Selected'
            ) || '#072c15';
        selectedNavItem.style.borderRadius = '0px';
      }
    }, 100);
  }
}
