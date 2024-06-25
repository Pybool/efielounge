import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { GLOBAL_HTTP_PROVIDERS } from './global-providers';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), ...GLOBAL_HTTP_PROVIDERS]
};
