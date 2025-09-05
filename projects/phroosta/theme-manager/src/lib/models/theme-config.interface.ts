import { Theme } from "./theme.interface";

export interface ThemeManagerConfig {
  themes: Theme[];
  defaultTheme?: string;
  storageKey?: string; // default: 'selected-theme'
  autoDetectPrefersDark?: boolean; // default: true
  enableLogging?: boolean; // default: false
}