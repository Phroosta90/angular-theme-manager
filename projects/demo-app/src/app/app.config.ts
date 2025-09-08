import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Theme, provideThemeManager } from '@phroosta/theme-manager';

import { routes } from './app.routes';

const lightTheme: Theme = {
  id: 'light',
  name: 'Light Theme',
  isDark: false,
  colors: {
    primary: '#3f51b5',
    secondary: '#ff4081',
    accent: '#ff9800',
    warn: '#f44336',
    background: '#fafafa',
    surface: '#ffffff',
    textPrimary: 'rgba(0, 0, 0, 0.87)',
    textSecondary: 'rgba(0, 0, 0, 0.54)',
    divider: 'rgba(0, 0, 0, 0.12)'
  }
};

const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark Theme',
  isDark: true,
  colors: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    accent: '#ff9800',
    warn: '#cf6679',
    background: '#121212',
    surface: '#1e1e1e',
    textPrimary: 'rgba(255, 255, 255, 0.87)',
    textSecondary: 'rgba(255, 255, 255, 0.60)',
    divider: 'rgba(255, 255, 255, 0.12)'
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideThemeManager({
      themes: [lightTheme, darkTheme],
      defaultTheme: 'light',
      autoDetectPrefersDark: true,
      enableLogging: true
    })
  ]
};
