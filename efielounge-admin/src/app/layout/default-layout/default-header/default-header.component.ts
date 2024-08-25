import { Component, computed, DestroyRef, inject, Input } from '@angular/core';
import {
  AvatarComponent,
  BadgeComponent,
  BreadcrumbRouterComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  ProgressBarDirective,
  ProgressComponent,
  SidebarToggleDirective,
  TextColorDirective,
  ThemeDirective,
} from '@coreui/angular';
import { CommonModule, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [
    HttpClientModule,
    ContainerComponent,
    HeaderTogglerDirective,
    SidebarToggleDirective,
    IconDirective,
    HeaderNavComponent,
    NavItemComponent,
    NavLinkDirective,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    BreadcrumbRouterComponent,
    ThemeDirective,
    DropdownComponent,
    DropdownToggleDirective,
    TextColorDirective,
    AvatarComponent,
    DropdownMenuDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    BadgeComponent,
    DropdownDividerDirective,
    ProgressBarDirective,
    ProgressComponent,
    NgStyle,
    CommonModule
  ],
  providers: [AuthService],
})
export class DefaultHeaderComponent extends HeaderComponent {
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  public user: any = JSON.parse(window.localStorage.getItem('user')!) as any;
  public severUrl = environment.api;
  public avatar: string = './assets/images/avatars/8.jpg';

  public notifications: any[] = [];

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return (
      this.colorModes.find((mode) => mode.name === currentMode)?.icon ??
      'cilSun'
    );
  });

  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {
    super();
    this.#colorModeService.localStorageItemName.set(
      'efielounge-admin-theme-default'
    );
    this.#colorModeService.eventName.set('ColorSchemeChange');
    if (this.user?.avatar) {
      this.avatar = this.severUrl + '/' + this.user?.avatar;
    }

    this.#activatedRoute.queryParams
      .pipe(
        delay(1),
        map((params) => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
        filter((theme) => ['dark', 'light', 'auto'].includes(theme)),
        tap((theme) => {
          this.colorMode.set(theme);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  @Input() sidebarId: string = 'sidebar1';

  ngOnInit() {
    this.socketService
      .fetchNotificationsObs()
      .subscribe(
        (notifications: any) => {
          if (notifications) {
            this.notifications = notifications;
            console.log("this.notifications ", this.notifications)
          }
        },
        (error: any) => {
          console.log('Failed to fetch notifications');
        }
      );
  }

  async logOut() {
    await this.authService.logout();
  }

  showNotificationDropdown() {
    const notificationDropdown = document.querySelector(
      '.notification-dropdown'
    ) as any;
    if (notificationDropdown) {
      notificationDropdown.classList.add('show');
    }
  }

  hideNotificationDropdown() {
    const notificationDropdown = document.querySelector(
      '.notification-dropdown'
    ) as any;
    if (notificationDropdown) {
      notificationDropdown.classList.remove('show');
    }
  }
}
