import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@emotion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

const getCardStyles = (
  theme: Theme,
  variant: CardProps['variant'] = 'elevated',
  padding: CardProps['padding'] = 'md',
  hover = false,
  interactive = false
) => {
  // Padding styles
  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: theme.spacing[3] },
    md: { padding: theme.spacing[4] },
    lg: { padding: theme.spacing[6] },
    xl: { padding: theme.spacing[8] },
  };

  // Variant styles
  const variantStyles = {
    elevated: {
      backgroundColor: theme.colors.background.elevated,
      border: 'none',
      boxShadow: theme.shadows.md,
      '&:hover': hover && {
        boxShadow: theme.shadows.lg,
        transform: 'translateY(-2px)',
      },
    },
    outlined: {
      backgroundColor: theme.colors.background.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      boxShadow: 'none',
      '&:hover': hover && {
        borderColor: theme.colors.border.secondary,
        boxShadow: theme.shadows.sm,
        transform: 'translateY(-1px)',
      },
    },
    filled: {
      backgroundColor: theme.colors.background.secondary,
      border: 'none',
      boxShadow: 'none',
      '&:hover': hover && {
        backgroundColor: theme.colors.background.tertiary,
        transform: 'translateY(-1px)',
      },
    },
    glass: {
      background: theme.colors.glass.background,
      backdropFilter: `blur(${theme.blur.lg})`,
      WebkitBackdropFilter: `blur(${theme.blur.lg})`,
      border: `1px solid ${theme.colors.glass.border}`,
      boxShadow: `0 8px 32px ${theme.colors.glass.shadow}`,
      '&:hover': hover && {
        border: `1px solid ${theme.colors.border.secondary}`,
        boxShadow: `0 12px 40px ${theme.colors.glass.shadow}, ${theme.shadows.glow}`,
        transform: 'translateY(-2px)',
      },
    },
  };

  const interactiveStyles = interactive && {
    cursor: 'pointer',
    userSelect: 'none' as const,
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: theme.shadows.sm,
    },
  };

  return {
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...interactiveStyles,
  };
};

const StyledCard = styled.div<{
  variant: CardProps['variant'];
  padding: CardProps['padding'];
  hover: boolean;
  interactive: boolean;
}>`
  /* Base styles */
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.easing.out};
  position: relative;
  overflow: hidden;

  /* Apply dynamic styles */
  ${(props) =>
    getCardStyles(props.theme, props.variant, props.padding, props.hover, props.interactive)}

  /* Focus styles for interactive cards */
  ${(props) =>
    props.interactive &&
    `
    &:focus-visible {
      outline: 2px solid ${props.theme.colors.border.focus};
      outline-offset: 2px;
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const CardTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const CardContent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};

  & > * + * {
    margin-top: ${({ theme }) => theme.spacing[3]};
  }
`;

const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};

  &:empty {
    display: none;
  }
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-left: auto;

  &:first-child {
    margin-left: 0;
  }
`;

// Compound component with sub-components
interface CardComponent extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Subtitle: typeof CardSubtitle;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
  Actions: typeof CardActions;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      padding = 'md',
      hover = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledCard
        ref={ref}
        variant={variant}
        padding={padding}
        hover={hover}
        interactive={interactive}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
) as CardComponent;

// Attach sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;

Card.displayName = 'Card';