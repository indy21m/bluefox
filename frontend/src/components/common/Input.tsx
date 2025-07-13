import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  search?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  search = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    search ? 'search-input' : 'form-input',
    className
  ].filter(Boolean).join(' ');

  if (search) {
    return (
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
    );
  }

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className="text-error text-sm" style={{ marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;