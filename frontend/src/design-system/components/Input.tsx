import React, { forwardRef, useState } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@emotion/react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'ghost';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  isLoading?: boolean;
}

const getInputStyles = (
  theme: Theme,
  size: InputProps['size'] = 'md',
  variant: InputProps['variant'] = 'outlined',
  error = false,
  hasValue = false,
  isFocused = false
) => {
  // Size styles
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.md,
    },
    md: {
      height: '40px',
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borderRadius.lg,
    },
    lg: {
      height: '48px',
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borderRadius.lg,
    },
  };

  // Variant styles
  const variantStyles = {
    outlined: {
      backgroundColor: theme.colors.background.primary,
      border: `1px solid ${error ? theme.colors.border.error : theme.colors.border.primary}`,
      '&:hover': {
        borderColor: error ? theme.colors.border.error : theme.colors.border.secondary,
      },
      '&:focus': {
        borderColor: error ? theme.colors.border.error : theme.colors.border.focus,
        boxShadow: `0 0 0 3px ${error 
          ? `${theme.colors.error[500]}20` 
          : `${theme.colors.brand.primary}20`}`,
      },
    },
    filled: {
      backgroundColor: theme.colors.background.secondary,
      border: `1px solid transparent`,
      '&:hover': {
        backgroundColor: theme.colors.background.tertiary,
      },
      '&:focus': {
        backgroundColor: theme.colors.background.primary,
        borderColor: error ? theme.colors.border.error : theme.colors.border.focus,
        boxShadow: `0 0 0 3px ${error 
          ? `${theme.colors.error[500]}20` 
          : `${theme.colors.brand.primary}20`}`,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      border: `1px solid transparent`,
      borderBottom: `2px solid ${error ? theme.colors.border.error : theme.colors.border.primary}`,
      borderRadius: 0,
      '&:hover': {
        borderBottomColor: error ? theme.colors.border.error : theme.colors.border.secondary,
      },
      '&:focus': {
        borderBottomColor: error ? theme.colors.border.error : theme.colors.border.focus,
      },
    },
  };

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

const InputWrapper = styled.div<{ isFullWidth: boolean }>`
  position: relative;
  width: ${({ isFullWidth }) => (isFullWidth ? '100%' : 'auto')};
  display: inline-block;
`;

const StyledInput = styled.input<{
  size: InputProps['size'];
  variant: InputProps['variant'];
  error: boolean;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  hasLabel: boolean;
}>`
  /* Base styles */
  width: 100%;
  font-family: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: transparent;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};
  outline: none;
  appearance: none;

  /* Apply dynamic styles */
  ${({ theme, size, variant, error }) => getInputStyles(theme, size, variant, error)}

  /* Icon padding adjustments */
  ${({ theme, hasLeftIcon, size }) =>
    hasLeftIcon &&
    `padding-left: ${
      size === 'sm' ? theme.spacing[8] : size === 'lg' ? theme.spacing[12] : theme.spacing[10]
    };`}

  ${({ theme, hasRightIcon, size }) =>
    hasRightIcon &&
    `padding-right: ${
      size === 'sm' ? theme.spacing[8] : size === 'lg' ? theme.spacing[12] : theme.spacing[10]
    };`}

  /* Label padding adjustment */
  ${({ hasLabel, theme, size }) =>
    hasLabel &&
    `padding-top: ${
      size === 'sm' ? theme.spacing[4] : size === 'lg' ? theme.spacing[6] : theme.spacing[5]
    };`}

  /* Placeholder styles */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
    opacity: 1;
  }

  /* Autofill styles */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.background.primary} inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const FloatingLabel = styled.label<{
  size: InputProps['size'];
  variant: InputProps['variant'];
  hasValue: boolean;
  isFocused: boolean;
  error: boolean;
}>`
  position: absolute;
  left: ${({ theme, size }) =>
    size === 'sm' ? theme.spacing[3] : size === 'lg' ? theme.spacing[6] : theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme, error, isFocused }) =>
    error
      ? theme.colors.border.error
      : isFocused
      ? theme.colors.border.focus
      : theme.colors.text.tertiary};
  font-size: ${({ theme, size }) =>
    size === 'sm' ? theme.typography.fontSize.sm : theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  pointer-events: none;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding: 0 ${({ theme }) => theme.spacing[1]};

  /* Float when focused or has value */
  ${({ hasValue, isFocused, theme, size, variant }) =>
    (hasValue || isFocused) &&
    `
    top: ${variant === 'ghost' ? '0' : '2px'};
    transform: translateY(0);
    font-size: ${theme.typography.fontSize.xs};
    font-weight: ${theme.typography.fontWeight.semibold};
  `}
`;

const IconWrapper = styled.div<{
  position: 'left' | 'right';
  size: InputProps['size'];
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position, theme, size }) =>
    position === 'left'
      ? `left: ${size === 'sm' ? theme.spacing[2] : size === 'lg' ? theme.spacing[4] : theme.spacing[3]};`
      : `right: ${size === 'sm' ? theme.spacing[2] : size === 'lg' ? theme.spacing[4] : theme.spacing[3]};`}
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;

  svg {
    width: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
    height: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
  }
`;

const HelperText = styled.div<{ error: boolean }>`
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, error }) =>
    error ? theme.colors.border.error : theme.colors.text.tertiary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.colors.text.tertiary};
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorMessage,
      size = 'md',
      variant = 'outlined',
      leftIcon,
      rightIcon,
      isFullWidth = false,
      isLoading = false,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const hasValue = Boolean(value !== undefined ? value : internalValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const displayedValue = value !== undefined ? value : internalValue;

    return (
      <InputWrapper isFullWidth={isFullWidth}>
        {leftIcon && (
          <IconWrapper position="left" size={size}>
            {leftIcon}
          </IconWrapper>
        )}

        {(rightIcon || isLoading) && (
          <IconWrapper position="right" size={size}>
            {isLoading ? <LoadingSpinner /> : rightIcon}
          </IconWrapper>
        )}

        <StyledInput
          ref={ref}
          size={size}
          variant={variant}
          error={error}
          hasLeftIcon={Boolean(leftIcon)}
          hasRightIcon={Boolean(rightIcon) || isLoading}
          hasLabel={Boolean(label)}
          value={displayedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {label && (
          <FloatingLabel
            size={size}
            variant={variant}
            hasValue={hasValue}
            isFocused={isFocused}
            error={error}
          >
            {label}
          </FloatingLabel>
        )}

        {(helperText || errorMessage) && (
          <HelperText error={error}>
            {error && errorMessage ? errorMessage : helperText}
          </HelperText>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';