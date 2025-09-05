import { InjectionToken } from "@angular/core";
import { ThemeManagerConfig } from "../models/theme-config.interface";

export const THEME_MANAGER_CONFIG = new InjectionToken<ThemeManagerConfig>(
  'theme-manager.config'
);