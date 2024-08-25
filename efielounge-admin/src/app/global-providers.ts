import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimeoutInterceptor } from './services/timeout.interceptor';
import { AuthInterceptor } from './services/auth.inteceptor';

export const GLOBAL_HTTP_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
