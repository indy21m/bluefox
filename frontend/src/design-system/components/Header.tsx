import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../ThemeProvider';
import { Button } from './Button';
import { useBreakpoint } from '../ThemeProvider';

export interface HeaderProps {
  logo?: React.ReactNode;
  title?: string;
  navigation?: NavItem[];
  actions?: React.ReactNode;
  variant?: 'elevated' | 'glass' | 'minimal';
  sticky?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  icon?: React.ReactNode;
}

const HeaderContainer = styled.header<{
  variant: HeaderProps['variant'];
  sticky: boolean;
}>`
  width: 100%;
  transition: all ${({ theme }) => theme.transitions.normal} ${({ theme }) => theme.easing.out};
  z-index: 1000;
  
  ${({ sticky }) => sticky && `
    position: sticky;
    top: 0;
  `}

  ${({ theme, variant }) => {
    switch (variant) {
      case 'glass':
        return `
          background: ${theme.colors.glass.background};
          backdrop-filter: blur(${theme.blur.lg});
          -webkit-backdrop-filter: blur(${theme.blur.lg});
          border-bottom: 1px solid ${theme.colors.glass.border};
          box-shadow: 0 1px 3px ${theme.colors.glass.shadow};
        `;
      case 'elevated':
        return `
          background: ${theme.colors.background.elevated};
          border-bottom: 1px solid ${theme.colors.border.primary};
          box-shadow: ${theme.shadows.sm};
        `;
      case 'minimal':
      default:
        return `
          background: ${theme.colors.background.primary};
          border-bottom: 1px solid ${theme.colors.border.primary};
        `;
    }
  }}
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
    height: 56px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

const LogoText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ theme }) => theme.colors.brand.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  background: transparent;
  color: ${({ theme, active }) => 
    active ? theme.colors.brand.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, active }) => 
    active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Icons components
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  logo,
  title = "🦊 BlueFox",
  navigation = [],
  actions,
  variant = 'glass',
  sticky = true,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { isMobile } = useBreakpoint();

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <HeaderContainer variant={variant} sticky={sticky}>
      <HeaderContent>
        <LogoSection>
          {logo || <LogoText>{title}</LogoText>}
        </LogoSection>

        {navigation.length > 0 && (
          <Navigation>
            {navigation.map((item, index) => (
              <NavLink
                key={index}
                active={item.active}
                onClick={() => handleNavClick(item)}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </NavLink>
            ))}
          </Navigation>
        )}

        <ActionsSection>
          <ThemeToggle
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </ThemeToggle>

          {actions}

          {isMobile && navigation.length > 0 && (
            <MobileMenuButton title="Open menu">
              <MenuIcon />
            </MobileMenuButton>
          )}
        </ActionsSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

Header.displayName = 'Header';