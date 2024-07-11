export const navItems: any = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'COMING SOON',
    },
  },
  {
    name: 'Menu & Categories',
    url: '/menu-categories',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Categories',
        url: '/menu-categories',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'MenuItem',
        url: '/menuitem',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'MenuItem Categories',
        url: '/menuitem-categories',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Menu',
        url: '/menu',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  {
    name: 'Orders',
    url: '/orders',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
    },
  },
  {
    name: 'Users',
    url: '/users',
    iconComponent: { name: 'cil-speedometer' }
  },

  {
    name: 'Login',
    url: '/login',
    iconComponent: { name: 'cil-speedometer' },
  },
  {
    name: 'Register',
    url: '/register',
    iconComponent: { name: 'cil-speedometer' },
  },
];
