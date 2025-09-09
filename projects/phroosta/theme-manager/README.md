# Angular Theme Manager 🎨

[![npm version](https://img.shields.io/npm/v/@phroosta/theme-manager.svg)](https://www.npmjs.com/package/@phroosta/theme-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-16%2B-red)](https://angular.io/)

A powerful, flexible theme management library for Angular applications with runtime theme switching, dark mode support, and white-label capabilities.

## ✨ Features

- 🌓 **Dark/Light Mode Toggle** - Seamless switching between color schemes
- 🎨 **Multiple Themes** - Support for unlimited custom themes
- 💾 **Persistence** - Remembers user's theme preference
- 🔄 **Runtime Switching** - Change themes without page reload
- 📱 **System Preference Detection** - Automatically follows OS theme
- 🏢 **White-label Ready** - Perfect for multi-tenant applications
- ⚡ **Performance Optimized** - Uses Angular Signals for efficient updates
- 🎯 **Type-Safe** - Full TypeScript support with interfaces
- 📦 **Tree-Shakeable** - Only import what you need
- 🔧 **Customizable** - Extensive configuration options

## 📦 Installation

```bash
npm install @phroosta/theme-manager
```

## 🚀 Quick Start

### 1. Basic Setup (Standalone)

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideThemeManager, Theme } from '@your-scope/theme-manager';

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
    divider: 'rgba(0, 0, 0, 0.12)',
  },
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
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideThemeManager({
      themes: [lightTheme, darkTheme],
      defaultTheme: 'light',
      autoDetectPrefersDark: true,
    }),
  ],
};
```

### 2. Using in Component

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@your-scope/theme-manager';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <!-- Theme Toggle Button -->
      <button (click)="themeService.toggleDarkMode()">
        {{ themeService.isDarkMode() ? '☀️' : '🌙' }}
        Switch to {{ themeService.isDarkMode() ? 'Light' : 'Dark' }} Mode
      </button>

      <!-- Theme Selector Dropdown -->
      <select [value]="themeService.themeId()" (change)="onThemeChange($event)">
        @for (theme of themes; track theme.id) {
        <option [value]="theme.id">{{ theme.name }}</option>
        }
      </select>

      <!-- Display Current Theme Info -->
      <p>Current theme: {{ themeService.themeName() }}</p>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 20px;
        background: var(--theme-background);
        color: var(--theme-text-primary);
        min-height: 100vh;
        transition: all 0.3s ease;
      }

      button {
        padding: 10px 20px;
        background: var(--theme-primary);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      select {
        padding: 8px;
        background: var(--theme-surface);
        color: var(--theme-text-primary);
        border: 1px solid var(--theme-divider);
        border-radius: 4px;
      }
    `,
  ],
})
export class AppComponent {
  themeService = inject(ThemeService);
  themes = this.themeService.getAvailableThemes();

  onThemeChange(event: Event): void {
    const themeId = (event.target as HTMLSelectElement).value;
    this.themeService.setTheme(themeId);
  }
}
```

### 3. Using CSS Variables

The library automatically applies CSS variables to the document root. Use them in your styles:

```css
.card {
  background: var(--theme-surface);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-divider);
  border-radius: 8px;
  padding: 16px;
}

.button-primary {
  background: var(--theme-primary);
  color: white;
}

.button-secondary {
  background: var(--theme-secondary);
  color: white;
}

.text-muted {
  color: var(--theme-text-secondary);
}

/* Automatic transitions when theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## 📖 Advanced Usage

### Dynamic Theme Loading from JSON

Load themes from a JSON file or API instead of hardcoding them:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideThemeManager, ThemeService } from '@your-scope/theme-manager';
import { provideAppInitializer } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideThemeManager({
      themes: [], // Start with empty themes
      autoDetectPrefersDark: true,
    }),
    provideAppInitializer(() => {
      const http = inject(HttpClient);
      const themeService = inject(ThemeService);

      return firstValueFrom(http.get<Theme[]>('/assets/themes.json')).then((themes) => {
        themes.forEach((theme) => themeService.registerTheme(theme));
        themeService.setTheme(themes[0].id);
      });
    }),
  ],
};
```

### Example themes.json:

```json
[
  {
    "id": "ocean",
    "name": "Ocean Blue",
    "isDark": false,
    "colors": {
      "primary": "#006994",
      "secondary": "#00A8CC",
      "accent": "#5EB3D6",
      "warn": "#F73859",
      "background": "#F0F8FF",
      "surface": "#FFFFFF",
      "textPrimary": "#003049",
      "textSecondary": "#5E7C8B",
      "divider": "#B8D4E3"
    }
  },
  {
    "id": "forest",
    "name": "Forest Green",
    "isDark": true,
    "colors": {
      "primary": "#2D5016",
      "secondary": "#73A942",
      "accent": "#AAD576",
      "warn": "#AA4B6B",
      "background": "#1A1A2E",
      "surface": "#16213E",
      "textPrimary": "#E8F5E9",
      "textSecondary": "#A5D6A7",
      "divider": "#4A5568"
    }
  }
]
```

### White-label / Multi-tenant Support

Perfect for SaaS applications where each customer needs their own branding:

```typescript
// theme-loader.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ThemeService, Theme } from '@your-scope/theme-manager';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeLoaderService {
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);

  async loadOrganizationThemes(): Promise<void> {
    // Get organization from URL, subdomain, or auth token
    const orgId = this.getOrganizationId();

    try {
      // Fetch themes from your backend
      const themes = await firstValueFrom(
        this.http.get<Theme[]>(`/api/organizations/${orgId}/themes`)
      );

      // Register all organization themes
      themes.forEach((theme) => {
        this.themeService.registerTheme(theme);
      });

      // Apply the default theme
      const defaultTheme = themes.find((t) => t.id === 'default') || themes[0];
      if (defaultTheme) {
        this.themeService.setTheme(defaultTheme.id);
      }
    } catch (error) {
      console.error('Failed to load organization themes', error);
      // Fallback to default theme
      this.loadFallbackTheme();
    }
  }

  private getOrganizationId(): string {
    // Example: Extract from subdomain (acme.app.com)
    const subdomain = window.location.hostname.split('.')[0];
    return subdomain;
  }

  private loadFallbackTheme(): void {
    const fallback: Theme = {
      id: 'fallback',
      name: 'Default Theme',
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
        divider: 'rgba(0, 0, 0, 0.12)',
      },
    };
    this.themeService.registerTheme(fallback);
    this.themeService.setTheme('fallback');
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideThemeManager({ themes: [] }),
    provideAppInitializer(() => {
      const loader = inject(ThemeLoaderService);
      return loader.loadOrganizationThemes();
    }),
  ],
};
```

### Lazy Loading Themes

Load themes on-demand to improve initial load time:

```typescript
@Component({
  selector: 'app-theme-selector',
  template: `
    <select (change)="loadAndApplyTheme($event)">
      <option value="">Select premium theme...</option>
      <option value="neon">Neon Lights</option>
      <option value="vintage">Vintage</option>
      <option value="minimal">Minimal</option>
    </select>
  `,
})
export class ThemeSelectorComponent {
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private loadedThemes = new Set<string>();

  async loadAndApplyTheme(event: Event): Promise<void> {
    const themeId = (event.target as HTMLSelectElement).value;
    if (!themeId) return;

    // Check if already loaded
    if (this.loadedThemes.has(themeId)) {
      this.themeService.setTheme(themeId);
      return;
    }

    try {
      // Load theme dynamically
      const theme = await firstValueFrom(this.http.get<Theme>(`/assets/themes/${themeId}.json`));

      // Register and apply
      this.themeService.registerTheme(theme);
      this.themeService.setTheme(themeId);
      this.loadedThemes.add(themeId);
    } catch (error) {
      console.error(`Failed to load theme: ${themeId}`, error);
    }
  }
}
```

### Custom Theme Builder

Allow users to create their own themes:

```typescript
@Component({
  selector: 'app-theme-builder',
  template: `
    <div class="theme-builder">
      <input type="color" [(ngModel)]="customColors.primary" (change)="updateCustomTheme()" />
      <input type="color" [(ngModel)]="customColors.secondary" (change)="updateCustomTheme()" />
      <button (click)="saveCustomTheme()">Save Theme</button>
    </div>
  `,
})
export class ThemeBuilderComponent {
  private themeService = inject(ThemeService);

  customColors = {
    primary: '#3f51b5',
    secondary: '#ff4081',
    // ... other colors
  };

  updateCustomTheme(): void {
    const customTheme: Theme = {
      id: 'custom',
      name: 'My Custom Theme',
      isDark: false,
      colors: {
        ...this.customColors,
        // Calculate complementary colors
        background: this.lighten(this.customColors.primary, 95),
        surface: '#ffffff',
        textPrimary: this.darken(this.customColors.primary, 80),
        textSecondary: this.darken(this.customColors.primary, 60),
        divider: this.lighten(this.customColors.primary, 80),
      },
    };

    this.themeService.registerTheme(customTheme);
    this.themeService.setTheme('custom');
  }

  saveCustomTheme(): void {
    const theme = this.themeService.getThemeById('custom');
    if (theme) {
      // Save to backend or localStorage
      localStorage.setItem('user-custom-theme', JSON.stringify(theme));
    }
  }

  private lighten(color: string, percent: number): string {
    // Implementation of color lightening
    return color; // Simplified
  }

  private darken(color: string, percent: number): string {
    // Implementation of color darkening
    return color; // Simplified
  }
}
```

## 🔧 Configuration Options

| Option                  | Type      | Default            | Description                         |
| ----------------------- | --------- | ------------------ | ----------------------------------- |
| `themes`                | `Theme[]` | `[]`               | Array of available themes           |
| `defaultTheme`          | `string`  | `'light'`          | Default theme ID to use             |
| `storageKey`            | `string`  | `'selected-theme'` | localStorage key for persistence    |
| `autoDetectPrefersDark` | `boolean` | `true`             | Auto-detect system theme preference |
| `enableLogging`         | `boolean` | `false`            | Enable debug logging                |

## 📱 API Reference

### ThemeService Methods

| Method                        | Description                        |
| ----------------------------- | ---------------------------------- |
| `setTheme(themeId: string)`   | Apply a specific theme             |
| `toggleDarkMode()`            | Toggle between light/dark themes   |
| `cycleTheme()`                | Cycle through all available themes |
| `registerTheme(theme: Theme)` | Add a new theme dynamically        |
| `getAvailableThemes()`        | Get list of all themes             |
| `getThemeById(id: string)`    | Get a specific theme               |
| `resetToSystemPreference()`   | Reset to OS theme preference       |
| `isUsingSystemPreference()`   | Check if using system theme        |

### Signals (Reactive State)

| Signal           | Type            | Description                 |
| ---------------- | --------------- | --------------------------- |
| `currentTheme()` | `Theme \| null` | Currently active theme      |
| `isDarkMode()`   | `boolean`       | Whether dark mode is active |
| `themeId()`      | `string`        | Current theme ID            |
| `themeName()`    | `string`        | Current theme name          |
