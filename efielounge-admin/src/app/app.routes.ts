import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/routes').then((m) => m.routes),
      },
      {
        path: 'base',
        loadChildren: () => import('./views/base/routes').then((m) => m.routes),
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/routes').then((m) => m.routes),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/routes').then((m) => m.routes),
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/routes').then((m) => m.routes),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/routes').then((m) => m.routes),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/routes').then((m) => m.routes),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/routes').then((m) => m.routes),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/routes').then((m) => m.routes),
      },
      {
        path: 'menu-categories',
        loadComponent: () =>
          import(
            './views/pages/categories/categories-list/categories-list.component'
          ).then((m) => m.CategoriesListComponent),
        data: {
          title: 'Menu Categories',
        },
      },
      {
        path: 'menuitem-categories',
        loadComponent: () =>
          import(
            './views/pages/categories/menuitem-categories/menuitem-categories.component'
          ).then((m) => m.MenuitemCategoriesComponent),
        data: {
          title: 'Menu Item Categories',
        },
      },
      {
        path: 'menuitem',
        loadComponent: () =>
          import('./views/pages/categories/menuitem/menuitem.component').then(
            (m) => m.MenuitemComponent
          ),
        data: {
          title: 'Menu Item',
        },
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./views/pages/categories/menu/menu.component').then(
            (m) => m.MenuComponent
          ),
        data: {
          title: 'Menu',
        },
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./views/pages/orders/orders.component').then(
            (m) => m.OrdersComponent
          ),
        data: {
          title: 'Orders',
        },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./views/pages/accounts/accounts.component').then(
            (m) => m.AccountsComponent
          ),
        data: {
          title: 'Users',
        },
      },
      {
        path: 'account-profile/:uid',
        loadComponent: () =>
          import(
            './views/pages/account-profile/account-profile.component'
          ).then((m) => m.AccountProfileComponent),
        data: {
          title: 'Profile',
        },
      },
      {
        path: 'client-site-configuration',
        loadComponent: () =>
          import('./views/pages/client-site-homepage/client-site-homepage.component').then(
            (m) => m.ClientSiteHomepageComponent
          ),
        data: {
          title: 'Configurations',
        },    
      },
      

      
      
    ],
  },

  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component
      ),
    data: {
      title: 'Page 500',
    },
  },
  
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: {
      title: 'Login Page',
    },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./views/pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    data: {
      title: 'Register Page',
    },
  },
  {
    path: 'account-verification',
    title: 'Account Verification',
    loadComponent: () =>
      import(
        './views/pages/otp-authorize/otp-authorize.component'
      ).then((m) => m.OtpAuthorizeComponent),
    data: {
      title: 'Verify Account',
    },
  },
  { path: '**', redirectTo: 'dashboard' },
];
