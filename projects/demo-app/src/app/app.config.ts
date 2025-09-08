import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Theme, ThemeService, provideThemeManager } from '@phroosta/theme-manager';

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideThemeManager({
      themes: [],
      autoDetectPrefersDark: true,
      enableLogging: false
    }),
    provideAppInitializer(() => {
      const http = inject(HttpClient);
      const themeService = inject(ThemeService);
      
      return firstValueFrom(
        http.get<Theme[]>('/assets/themes/themes.json')
      ).then(themes => {
        themes.forEach(theme => themeService.registerTheme(theme));
        themeService.setTheme(themes[0].id);
      }).catch(error => {
        console.error('Failed to load themes:', error);
      });
    })
  ]
};
