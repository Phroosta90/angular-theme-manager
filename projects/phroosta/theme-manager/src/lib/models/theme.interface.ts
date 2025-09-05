export interface ThemeColors {
  primaary: string;
  secondary: string;
  accent: string;
  warn: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
}

export interface ThemeTypography {
  fontFamily?: string;
  fontSize?: string;
  fontWeightLight?: string;
  fontWeightRegular?: string;
  fontWeightMedium?: string;
  fonWeightBold?: string;
}

export interface ThemeSpacing {
  unit?: number;
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
  custom?: Record<string, any>;
}