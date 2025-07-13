import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  dark = false,
  className = '',
  onClick,
  style
}) => {
  const classes = [
    'glass-card',
    dark ? 'glass-card-dark' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;