import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'centered';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  children: React.ReactNode;
}

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
`;

const Overlay = styled.div<{ isClosing?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(${({ theme }) => theme.blur.sm});
  -webkit-backdrop-filter: blur(${({ theme }) => theme.blur.sm});
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  
  animation: ${({ isClosing }) => (isClosing ? fadeOut : fadeIn)} 
    ${({ theme }) => theme.transitions.normal} 
    ${({ theme }) => theme.easing.out};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[2]};
  }
`;

const ModalContainer = styled.div<{
  size: ModalProps['size'];
  variant: ModalProps['variant'];
  isClosing?: boolean;
}>`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  outline: none;
  
  animation: ${({ isClosing }) => (isClosing ? slideOut : slideIn)} 
    ${({ theme }) => theme.transitions.normal} 
    ${({ theme }) => theme.easing.out};

  /* Size variants */
  ${({ size, theme }) => {
    const sizes = {
      sm: `
        width: 100%;
        max-width: 400px;
      `,
      md: `
        width: 100%;
        max-width: 500px;
      `,
      lg: `
        width: 100%;
        max-width: 700px;
      `,
      xl: `
        width: 100%;
        max-width: 900px;
      `,
      full: `
        width: 95vw;
        height: 95vh;
        max-width: none;
        max-height: none;
      `,
    };
    return sizes[size || 'md'];
  }}

  /* Variant styles */
  ${({ theme, variant }) => {
    switch (variant) {
      case 'glass':
        return `
          background: ${theme.colors.glass.background};
          backdrop-filter: blur(${theme.blur.lg});
          -webkit-backdrop-filter: blur(${theme.blur.lg});
          border: 1px solid ${theme.colors.glass.border};
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), ${theme.shadows.glow};
        `;
      case 'centered':
        return `
          background: ${theme.colors.background.elevated};
          border: 1px solid ${theme.colors.border.primary};
          box-shadow: ${theme.shadows['2xl']};
        `;
      case 'default':
      default:
        return `
          background: ${theme.colors.background.primary};
          border: 1px solid ${theme.colors.border.primary};
          box-shadow: ${theme.shadows.xl};
        `;
    }
  }}

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast} ${({ theme }) => theme.easing.out};

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[6]};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.border.primary};
  }
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Compound components
interface ModalComponent extends React.FC<ModalProps> {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Content: typeof ModalContent;
}

export const Modal: ModalComponent = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscapeKey = true,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = React.useState(false);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscapeKey || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscapeKey, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const modalContent = (
    <Overlay isClosing={isClosing} onClick={handleBackdropClick}>
      <ModalContainer
        ref={modalRef}
        size={size}
        variant={variant}
        isClosing={isClosing}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle id="modal-title">{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={handleClose} aria-label="Close modal">
                <CloseIcon />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </Overlay>
  );

  return createPortal(modalContent, document.body);
};

// Attach compound components
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Content = ModalContent;

Modal.displayName = 'Modal';