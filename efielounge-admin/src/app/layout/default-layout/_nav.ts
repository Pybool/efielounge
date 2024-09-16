export const navItems: any = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: '',
    },
  },
  {
    name: 'Menu & Categories',
    url: '/menu-categories',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Extras Categories',
        url: '/menuitem-categories',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Extras',
        url: '/menuitem',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Categories',
        url: '/menu-categories',
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
    name: 'Transactions',
    url: '/transactions',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
    },
  },
  {
    name: 'Customers',
    url: '/customers',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Staff',
    url: '/staff',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Website',
    url: '/client-site-configuration',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Chats',
    url: '/chats',
    iconComponent: { name: 'cil-speedometer' }
  },

];
