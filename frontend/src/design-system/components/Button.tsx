import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@emotion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  children: React.ReactNode;
}

const getButtonStyles = (
  theme: Theme,
  variant: ButtonProps['variant'] = 'primary',
  size: ButtonProps['size'] = 'md',
  isFullWidth = false,
  isLoading = false
) => {
  // Size styles
  const sizeStyles = {
    xs: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
      height: '24px',
      borderRadius: theme.borderRadius.md,
    },
    sm: {
      padding: `${theme.spacing[1.5]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      height: '32px',
      borderRadius: theme.borderRadius.md,
    },
    md: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      height: '40px',
      borderRadius: theme.borderRadius.lg,
    },
    lg: {
      padding: `${theme.spacing[2.5]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
      height: '48px',
      borderRadius: theme.borderRadius.lg,
    },
    xl: {
      padding: `${theme.spacing[3]} ${theme.spacing[8]}`,
      fontSize: theme.typography.fontSize.xl,
      height: '56px',
      borderRadius: theme.borderRadius.xl,
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      background: theme.colors.brand.gradient,
      color: theme.colors.white,
      border: 'none',
      '&:hover:not(:disabled)': {
        transform: 'translateY(-1px)',
        boxShadow: `${theme.shadows.lg}, ${theme.shadows.glow}`,
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
        boxShadow: theme.shadows.md,
      },
    },
    secondary: {
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      '&:hover:not(:disabled)': {
        backgroundColor: theme.colors.background.tertiary,
        borderColor: theme.colors.border.secondary,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.md,
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
        backgroundColor: theme.colors.background.secondary,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.brand.primary,
      border: 'none',
      '&:hover:not(:disabled)': {
        backgroundColor: theme.colors.background.secondary,
        transform: 'translateY(-1px)',
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
        backgroundColor: theme.colors.background.tertiary,
      },
    },
    danger: {
      backgroundColor: theme.colors.error[500],
      color: theme.colors.white,
      border: 'none',
      '&:hover:not(:disabled)': {
        backgroundColor: theme.colors.error.dark,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.lg,
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
        backgroundColor: theme.colors.error[500],
      },
    },
    success: {
      backgroundColor: theme.colors.success[500],
      color: theme.colors.white,
      border: 'none',
      '&:hover:not(:disabled)': {
        backgroundColor: theme.colors.success.dark,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.lg,
      },
      '&:active:not(:disabled)': {
        transform: 'translateY(0)',
        backgroundColor: theme.colors.success[500],
      },
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return {
    ...currentSize,
    ...currentVariant,
    width: isFullWidth ? '100%' : 'auto',
    opacity: isLoading ? 0.7 : 1,
    cursor: isLoading ? 'wait' : 'pointer',
  };
};

const StyledButton = styled.button<{
  variant: ButtonProps['variant'];
  size: ButtonProps['size'];
  isFullWidth: boolean;
  isLoading: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};
  position: relative;
  overflow: hidden;
  outline: none;
  white-space: nowrap;
  user-select: none;

  /* Apply dynamic styles */
  ${({ theme, variant, size, isFullWidth, isLoading }) =>
    getButtonStyles(theme, variant, size, isFullWidth, isLoading)}

  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* Loading state */
  ${({ isLoading }) =>
    isLoading &&
    `
    pointer-events: none;
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ButtonContent = styled.span<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      isFullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        isFullWidth={isFullWidth}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent isLoading={isLoading}>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </ButtonContent>
        {isLoading && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';