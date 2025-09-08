import { computed, DOCUMENT, effect, Inject, Injectable, Optional, signal } from '@angular/core';
import { Theme } from '../models/theme.interface';
import { ThemeManagerConfig } from '../models/theme-config.interface';
import { THEME_MANAGER_CONFIG } from '../tokens/theme-config.token';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private lastLightThemeId?: string;
  private lastDarkThemeId?: string;
  private initialized = false;

  private mediaQueryListener?: (e: MediaQueryListEvent) => void;
  private darkModeQuery?: MediaQueryList;

  private currentThemeSignal = signal<Theme | null>(null);
  private isDarkModeSignal = signal<boolean>(false);

  readonly currentTheme = this.currentThemeSignal.asReadonly();
  readonly isDarkMode = this.isDarkModeSignal.asReadonly();

  readonly themeId = computed(() => this.currentTheme()?.id || 'default');
  readonly themeName = computed(() => this.currentTheme()?.name || 'default');

  private config: ThemeManagerConfig;
  private availableThemes: Map<string, Theme> = new Map();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(THEME_MANAGER_CONFIG) config?: ThemeManagerConfig
  ) {
    // Default configuration
    this.config = {
      themes: [],
      defaultTheme: 'light',
      storageKey: 'selected-theme',
      autoDetectPrefersDark: true,
      enableLogging: false,
      ...config
    }

    if (this.config.themes && this.config.themes.length > 0) {
      this.initializeTheme();
      this.setupEffect();
    } else {
      // Altrimenti aspetta che vengano registrati
      this.setupEffect();
    }
  }

  private initializeTheme(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.config.themes.forEach(theme => {
      this.availableThemes.set(theme.id, theme);
    });
    
    const savedThemeId = this.getSavedThemeId();
    
    if (savedThemeId) {
      const savedTheme = this.availableThemes.get(savedThemeId);
      if (savedTheme) {
        this.applyThemeWithTracking(savedTheme);
        return;
      }
    }
    
    if (this.config.autoDetectPrefersDark) {
      const systemTheme = this.getSystemPreferredTheme();
      if (systemTheme) {
        this.applySystemTheme(systemTheme);
        this.setupSystemThemeListener();
        return;
      }
    }
    
    const defaultTheme = 
      (this.config.defaultTheme && this.availableThemes.get(this.config.defaultTheme)) ||
      this.config.themes[0];
    
    if (defaultTheme) {
      this.applySystemTheme(defaultTheme);
    }
  }

  private applyThemeWithTracking(theme: Theme): void {
    if (theme.isDark) {
      this.lastDarkThemeId = theme.id;
    } else {
      this.lastLightThemeId = theme.id;
    }
    
    this.currentThemeSignal.set(theme);
    this.isDarkModeSignal.set(theme.isDark);
  }

  private getSystemPreferredTheme(): Theme | undefined {
    if (!window?.matchMedia) {
      return undefined;
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return this.config.themes.find(theme => theme.isDark === prefersDark);
  }

  private setupSystemThemeListener(): void {
    if (!window?.matchMedia) return;
    
    this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      if (!this.getSavedThemeId()) {
        const newTheme = this.config.themes.find(
          theme => theme.isDark === e.matches
        );
        if (newTheme) {
          this.applySystemTheme(newTheme);
        }
      }
    };
    
    this.darkModeQuery.addEventListener('change', this.mediaQueryListener);
  }

  private setupEffect(): void {
    effect(() => {
      const theme = this.currentTheme();
      if (theme) {
        this.applyThemeToDOM(theme);
      }
    });
  }

  setTheme(themeId: string): void {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      console.warn(`Theme with id "${themeId}" not found`);
      return;
    }

    if (theme.isDark) {
      this.lastDarkThemeId = theme.id;
    } else {
      this.lastLightThemeId = theme.id;
    }

    this.currentThemeSignal.set(theme);
    this.isDarkModeSignal.set(theme.isDark);
    this.saveThemeId(themeId); // Salva la scelta utente
    
    if (this.config.enableLogging) {
      console.log(`Theme changed to: ${theme.name} (user choice)`);
    }
  }

  toggleDarkMode(): void {
    const currentTheme = this.currentTheme();
    if (!currentTheme) return;
    
    // Log per debug
    if (this.config.enableLogging) {
      console.log('Current theme:', currentTheme.id, 'isDark:', currentTheme.isDark);
      console.log('Last light theme:', this.lastLightThemeId);
      console.log('Last dark theme:', this.lastDarkThemeId);
      console.log('Available themes:', Array.from(this.availableThemes.keys()));
    }
    
    let targetThemeId: string | undefined;
    
    if (currentTheme.isDark) {
      // Trova un tema light
      targetThemeId = this.lastLightThemeId || 
                      this.findDefaultThemeByMode(false)?.id;
    } else {
      // Trova un tema dark
      targetThemeId = this.lastDarkThemeId || 
                      this.findDefaultThemeByMode(true)?.id;
    }
    
    if (this.config.enableLogging) {
      console.log('Target theme ID:', targetThemeId);
    }
    
    if (targetThemeId) {
      this.setTheme(targetThemeId);
    } else {
      console.warn('No theme found for mode:', currentTheme.isDark ? 'light' : 'dark');
    }
  }

  private findDefaultThemeByMode(isDark: boolean): Theme | undefined {
    // Cerca tra TUTTI i temi disponibili, non solo quelli in config
    return Array.from(this.availableThemes.values())
      .find(theme => theme.isDark === isDark);
  }

  cycleTheme(): void {
    const themes = this.getAvailableThemes();
    const currentTheme = this.currentTheme();
    
    if (!currentTheme || themes.length === 0) return;
    
    const currentIndex = themes.findIndex(t => t.id === currentTheme.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.setTheme(themes[nextIndex].id);
  }

  private applyThemeToDOM(theme: Theme) {
    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-mode', theme.isDark ? 'dark' : 'light');

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${this.kebabCase(key)}`, String(value));
    });

    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${this.kebabCase(key)}`, String(value));
      });
    }

    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--theme-spacing-${key}`, String(value));
      });
    }

    if (theme.custom) {
      Object.entries(theme.custom).forEach(([key, value]) => {
        root.style.setProperty(`--theme-custom-${this.kebabCase(key)}`, String(value));
      });
    }
  }

  // Helper methods
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getSavedThemeId(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(this.config.storageKey!);
  }

  private saveThemeId(themeId: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.config.storageKey!, themeId);
  }

  private applySystemTheme(theme: Theme): void {
    if (theme.isDark) {
      this.lastDarkThemeId = theme.id;
    } else {
      this.lastLightThemeId = theme.id;
    }

    this.currentThemeSignal.set(theme);
    this.isDarkModeSignal.set(theme.isDark);

    if (this.config.enableLogging) {
      console.log(`Applied system-preferred theme: ${theme.name}`);
    }
  }

  // Public API
  getAvailableThemes(): Theme[] {
    return Array.from(this.availableThemes.values());
  }

  getThemeById(id: string): Theme | undefined {
    return this.availableThemes.get(id);
  }

  registerTheme(theme: Theme): void {
    this.availableThemes.set(theme.id, theme);
    
    // Se è il primo tema registrato e non abbiamo ancora inizializzato
    if (!this.initialized && this.availableThemes.size > 0) {
      this.initializeTheme();
    }
    
    if (this.config.enableLogging) {
      console.log(`Theme registered: ${theme.name}`);
    }
  }

  ngOnDestroy(): void {
    if (this.darkModeQuery && this.mediaQueryListener) {
      this.darkModeQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  resetToSystemPreference(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.config.storageKey!);
    }
    
    const systemTheme = this.getSystemPreferredTheme();
    if (systemTheme) {
      this.applySystemTheme(systemTheme);
      this.setupSystemThemeListener();
    }
  }

  isUsingSystemPreference(): boolean {
    return !this.getSavedThemeId() && this.config.autoDetectPrefersDark === true;
  }
}
