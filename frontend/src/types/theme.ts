export interface SurveyTheme {
  id: string;
  name: string;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Structure
  structure: {
    widgetBorderRadius: number;
    widgetBorderWidth: number;
    buttonBorderRadius: number;
    gapBetweenButtons: number;
    gapBetweenFormFields: number;
    formMaxWidth: number;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    lineHeight: number;
    fontSize: {
      headline: number;
      description: number;
      answerOption: number;
      formField: number;
      submitButton: number;
    };
  };
  
  // Colors
  colors: {
    background: string;
    textOnBackground: string;
    buttonColor: string;
    textOnButtons: string;
    borderColor: string;
    primaryAccent: string;
    successColor: string;
    errorColor: string;
  };
  
  // Style
  style: {
    submitButtonAnimation: 'none' | 'pulse' | 'shake' | 'bounce';
    transitionSpeed: 'instant' | 'fast' | 'normal' | 'slow';
    boxShadow: 'none' | 'subtle' | 'medium' | 'strong';
  };
  
  // Custom CSS
  customCSS?: string;
}

export type ThemePreset = 'plain' | 'modern' | 'dark' | 'custom';

export interface ThemeEditorState {
  activeTheme: SurveyTheme;
  savedThemes: SurveyTheme[];
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
}

// Default theme presets
export const defaultThemes: Record<ThemePreset, Partial<SurveyTheme>> = {
  plain: {
    name: 'Plain',
    structure: {
      widgetBorderRadius: 8,
      widgetBorderWidth: 1,
      buttonBorderRadius: 6,
      gapBetweenButtons: 12,
      gapBetweenFormFields: 16,
      formMaxWidth: 600,
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.6,
      fontSize: {
        headline: 28,
        description: 16,
        answerOption: 16,
        formField: 16,
        submitButton: 16,
      },
    },
    colors: {
      background: '#FFFFFF',
      textOnBackground: '#1A1A1A',
      buttonColor: '#6366F1',
      textOnButtons: '#FFFFFF',
      borderColor: '#E5E7EB',
      primaryAccent: '#6366F1',
      successColor: '#10B981',
      errorColor: '#EF4444',
    },
    style: {
      submitButtonAnimation: 'none',
      transitionSpeed: 'normal',
      boxShadow: 'subtle',
    },
  },
  modern: {
    name: 'Modern',
    structure: {
      widgetBorderRadius: 16,
      widgetBorderWidth: 0,
      buttonBorderRadius: 12,
      gapBetweenButtons: 16,
      gapBetweenFormFields: 20,
      formMaxWidth: 650,
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.7,
      fontSize: {
        headline: 32,
        description: 18,
        answerOption: 17,
        formField: 17,
        submitButton: 17,
      },
    },
    colors: {
      background: '#F9FAFB',
      textOnBackground: '#111827',
      buttonColor: '#8B5CF6',
      textOnButtons: '#FFFFFF',
      borderColor: '#E5E7EB',
      primaryAccent: '#8B5CF6',
      successColor: '#10B981',
      errorColor: '#EF4444',
    },
    style: {
      submitButtonAnimation: 'pulse',
      transitionSpeed: 'fast',
      boxShadow: 'medium',
    },
  },
  dark: {
    name: 'Dark',
    structure: {
      widgetBorderRadius: 12,
      widgetBorderWidth: 1,
      buttonBorderRadius: 8,
      gapBetweenButtons: 14,
      gapBetweenFormFields: 18,
      formMaxWidth: 600,
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.6,
      fontSize: {
        headline: 30,
        description: 16,
        answerOption: 16,
        formField: 16,
        submitButton: 16,
      },
    },
    colors: {
      background: '#1F2937',
      textOnBackground: '#F9FAFB',
      buttonColor: '#6366F1',
      textOnButtons: '#FFFFFF',
      borderColor: '#374151',
      primaryAccent: '#6366F1',
      successColor: '#10B981',
      errorColor: '#F87171',
    },
    style: {
      submitButtonAnimation: 'none',
      transitionSpeed: 'normal',
      boxShadow: 'none',
    },
  },
  custom: {
    name: 'Custom Theme',
  },
};