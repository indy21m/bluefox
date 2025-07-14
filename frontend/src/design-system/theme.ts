import type { Theme } from '@emotion/react';
import { tokens } from './tokens';

export const createTheme = (isDark = false): Theme => ({
  ...tokens,
  colors: {
    ...tokens.colors,
    // Semantic color mappings
    background: {
      primary: isDark ? tokens.colors.gray[900] : tokens.colors.white,
      secondary: isDark ? tokens.colors.gray[800] : tokens.colors.gray[50],
      tertiary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[100],
      elevated: isDark ? tokens.colors.gray[800] : tokens.colors.white,
      overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: isDark ? tokens.colors.gray[100] : tokens.colors.gray[900],
      secondary: isDark ? tokens.colors.gray[300] : tokens.colors.gray[600],
      tertiary: isDark ? tokens.colors.gray[400] : tokens.colors.gray[500],
      inverse: isDark ? tokens.colors.gray[900] : tokens.colors.gray[100],
      disabled: isDark ? tokens.colors.gray[600] : tokens.colors.gray[400],
    },
    border: {
      primary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200],
      secondary: isDark ? tokens.colors.gray[600] : tokens.colors.gray[300],
      focus: tokens.colors.brand.primary,
      error: tokens.colors.error[500],
      success: tokens.colors.success[500],
    },
    // Interactive colors
    interactive: {
      primary: {
        default: tokens.colors.brand.primary,
        hover: tokens.colors.primary[600],
        pressed: tokens.colors.primary[700],
        disabled: tokens.colors.gray[300],
      },
      secondary: {
        default: isDark ? tokens.colors.gray[600] : tokens.colors.gray[200],
        hover: isDark ? tokens.colors.gray[500] : tokens.colors.gray[300],
        pressed: isDark ? tokens.colors.gray[400] : tokens.colors.gray[400],
        disabled: tokens.colors.gray[200],
      },
    },
    // Glass morphism colors
    glass: {
      background: isDark 
        ? 'rgba(31, 31, 31, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
      border: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.2)',
      shadow: isDark
        ? 'rgba(0, 0, 0, 0.5)'
        : 'rgba(31, 38, 135, 0.37)',
    },
  },
  isDark,
  mode: isDark ? 'dark' : 'light',
});

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

// Extend Emotion's Theme interface
declare module '@emotion/react' {
  export interface Theme {
    colors: typeof tokens.colors & {
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
        elevated: string;
        overlay: string;
      };
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        disabled: string;
      };
      border: {
        primary: string;
        secondary: string;
        focus: string;
        error: string;
        success: string;
      };
      interactive: {
        primary: {
          default: string;
          hover: string;
          pressed: string;
          disabled: string;
        };
        secondary: {
          default: string;
          hover: string;
          pressed: string;
          disabled: string;
        };
      };
      glass: {
        background: string;
        border: string;
        shadow: string;
      };
    };
    typography: typeof tokens.typography;
    spacing: typeof tokens.spacing;
    borderRadius: typeof tokens.borderRadius;
    shadows: typeof tokens.shadows;
    transitions: typeof tokens.transitions;
    easing: typeof tokens.easing;
    breakpoints: typeof tokens.breakpoints;
    zIndex: typeof tokens.zIndex;
    blur: typeof tokens.blur;
    isDark: boolean;
    mode: 'light' | 'dark';
  }
}