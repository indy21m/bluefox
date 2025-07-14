import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, options?: Partial<ToastMessage>) => void;
  error: (message: string, options?: Partial<ToastMessage>) => void;
  warning: (message: string, options?: Partial<ToastMessage>) => void;
  info: (message: string, options?: Partial<ToastMessage>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Animations
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  max-width: 400px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    top: ${({ theme }) => theme.spacing[2]};
    right: ${({ theme }) => theme.spacing[2]};
    left: ${({ theme }) => theme.spacing[2]};
    max-width: none;
  }
`;

const ToastItem = styled.div<{ 
  type: ToastMessage['type']; 
  isExiting?: boolean;
}>`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(${({ theme }) => theme.blur.lg});
  -webkit-backdrop-filter: blur(${({ theme }) => theme.blur.lg});
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-left: 4px solid;
  position: relative;
  overflow: hidden;
  
  animation: ${({ isExiting }) => (isExiting ? slideOutRight : slideInRight)} 
    ${({ theme }) => theme.transitions.normal} 
    ${({ theme }) => theme.easing.out};

  /* Type-specific border colors */
  ${({ theme, type }) => {
    const colors = {
      success: theme.colors.success[500],
      error: theme.colors.error[500],
      warning: theme.colors.warning[500],
      info: theme.colors.brand.primary,
    };
    return `border-left-color: ${colors[type]};`;
  }}

  /* Hover effect */
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ToastIcon = styled.div<{ type: ToastMessage['type'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  flex-shrink: 0;
  
  ${({ theme, type }) => {
    const colors = {
      success: theme.colors.success[500],
      error: theme.colors.error[500],
      warning: theme.colors.warning[500],
      info: theme.colors.brand.primary,
    };
    return `color: ${colors[type]};`;
  }}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToastTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const ToastActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const ToastAction = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.brand.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.brand.secondary};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.border.secondary};
  width: 100%;
  transform-origin: left;
  animation: progress ${({ duration }) => duration}ms linear;

  @keyframes progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
`;

// Icons
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const Toast: React.FC<{
  toast: ToastMessage;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
    }
  };

  return (
    <ToastItem type={toast.type} isExiting={isExiting}>
      <ToastHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ToastIcon type={toast.type}>{getIcon()}</ToastIcon>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        </div>
        <CloseButton onClick={handleRemove} aria-label="Close notification">
          <CloseIcon />
        </CloseButton>
      </ToastHeader>
      
      <ToastMessage>{toast.message}</ToastMessage>
      
      {toast.action && (
        <ToastActions>
          <ToastAction onClick={toast.action.onClick}>
            {toast.action.label}
          </ToastAction>
        </ToastActions>
      )}
      
      {toast.duration !== 0 && (
        <ProgressBar duration={toast.duration || 5000} />
      )}
    </ToastItem>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast({ type: 'success', message, ...options });
  }, [showToast]);

  const error = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast({ type: 'error', message, ...options });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast({ type: 'warning', message, ...options });
  }, [showToast]);

  const info = useCallback((message: string, options?: Partial<ToastMessage>) => {
    showToast({ type: 'info', message, ...options });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <ToastContainer>
            {toasts.map(toast => (
              <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </ToastContainer>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

ToastProvider.displayName = 'ToastProvider';

export { Toast };