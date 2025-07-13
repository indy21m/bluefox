import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'default' | 'lg';
  round?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  round = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    default: '',
    lg: 'btn-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    round ? 'btn-round' : '',
    loading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="loading-spinner"></div>}
      {children}
    </button>
  );
};

export default Button;