import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const globalStyles = (theme: Theme) => css`
  /* CSS Reset and Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.normal};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    transition: background-color ${theme.transitions.normal}, color ${theme.transitions.normal};
    overflow-x: hidden;
  }

  /* Typography Hierarchy */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin: 0;
    color: ${theme.colors.text.primary};
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
    font-weight: ${theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin: 0;
    color: ${theme.colors.text.primary};
    line-height: ${theme.typography.lineHeight.relaxed};
  }

  /* Links */
  a {
    color: ${theme.colors.brand.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};
    
    &:hover {
      color: ${theme.colors.primary[600]};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
      border-radius: ${theme.borderRadius.sm};
    }
  }

  /* Form Elements */
  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    transition: all ${theme.transitions.fast};
    
    &:focus-visible {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    transition: all ${theme.transitions.fast};
    
    &:focus {
      outline: none;
    }
    
    &::placeholder {
      color: ${theme.colors.text.tertiary};
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: ${theme.colors.background.secondary};
    }
  }

  /* Selection */
  ::selection {
    background-color: ${theme.colors.primary[200]};
    color: ${theme.colors.primary[900]};
  }

  ::-moz-selection {
    background-color: ${theme.colors.primary[200]};
    color: ${theme.colors.primary[900]};
  }

  /* Focus Styles */
  :focus-visible {
    outline: 2px solid ${theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.primary};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.border.secondary};
    }
  }

  /* Motion Preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .focus-ring {
    &:focus-visible {
      outline: 2px solid ${theme.colors.border.focus};
      outline-offset: 2px;
    }
  }

  /* Glass morphism utility */
  .glass {
    background: ${theme.colors.glass.background};
    backdrop-filter: blur(${theme.blur.lg});
    -webkit-backdrop-filter: blur(${theme.blur.lg});
    border: 1px solid ${theme.colors.glass.border};
    box-shadow: 0 8px 32px ${theme.colors.glass.shadow};
  }

  /* Gradient utilities */
  .gradient-brand {
    background: ${theme.colors.brand.gradient};
  }

  .gradient-text {
    background: ${theme.colors.brand.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.2s ease-out;
  }

  /* Keyframes */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Loading skeleton */
  .skeleton {
    background: linear-gradient(
      90deg,
      ${theme.colors.background.secondary} 25%,
      ${theme.colors.background.tertiary} 50%,
      ${theme.colors.background.secondary} 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Container utilities */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};
    
    @media (min-width: ${theme.breakpoints.sm}) {
      padding: 0 ${theme.spacing[6]};
    }
    
    @media (min-width: ${theme.breakpoints.lg}) {
      padding: 0 ${theme.spacing[8]};
    }
  }

  .container-sm {
    max-width: 640px;
  }

  .container-md {
    max-width: 768px;
  }

  .container-lg {
    max-width: 1024px;
  }

  .container-xl {
    max-width: 1280px;
  }

  .container-2xl {
    max-width: 1536px;
  }
`;