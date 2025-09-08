import { Component, Provider } from '@angular/core';
import { ThemeManagerConfig } from './models/theme-config.interface';
import { ThemeService } from './services/theme.service';
import { THEME_MANAGER_CONFIG } from './tokens/theme-config.token';

/**
 * Provides the Theme Manager service with configuration
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideThemeManager({
 *       themes: [lightTheme, darkTheme],
 *       defaultTheme: 'light'
 *     })
 *   ]
 * });
 * ```
 */
export function provideThemeManager(config?: ThemeManagerConfig): Provider[] {
  return [
    ThemeService,
    {
      provide: THEME_MANAGER_CONFIG,
      useValue: config || null
    }
  ];
}

export class ThemeManagerModule {
  static forRoot(config?: ThemeManagerConfig): Provider[] {
    return provideThemeManager(config);
  }
}
