import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { MainMenuComponent } from './pages/main-menu/main-menu.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { OtpAuthorizeComponent } from './pages/otp-authorize/otp-authorize.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { FoodDetailComponent } from './pages/food-detail/food-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartComponent } from './pages/cart/cart.component';
import { UploadReceiptComponent } from './pages/upload-receipt/upload-receipt.component';
import { SearchResultComponentComponent } from './pages/search-result-component/search-result-component.component';
import { RatingsComponent } from './components/ratings/ratings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'menu', component: MainMenuComponent },
  { path: 'menu-detail/:menuslug', component: FoodDetailComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'search-menu', component: SearchResultComponentComponent },
  { path: 'cart', component: CartComponent },
  { path: 'order-detail/:orderid', component: OrderDetailComponent },
  { path: 'checkout/:checkOutId', component: CheckoutComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'upload-proof-of-payment', component: UploadReceiptComponent },
  { path: 'ratings', component: RatingsComponent },
  {
    path: 'account-verification',
    title: 'Account Verification',
    component: OtpAuthorizeComponent,
  },
];
