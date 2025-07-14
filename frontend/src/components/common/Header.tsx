import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  showSearch = false,
  searchPlaceholder = "Search...",
  onSearchChange,
  rightContent
}) => {
  return (
    <header className="header">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 2rem', 
        width: '100%',
        maxWidth: 'none',
        margin: 0
      }}>
        <div className="logo">
          <span className="gradient-text text-2xl font-bold">🦊 BlueFox</span>
        </div>
        
        <div className="flex items-center gap-lg">
          {showSearch && (
            <input 
              type="search" 
              className="search-input" 
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          )}
          {rightContent}
        </div>
      </div>
    </header>
  );
};

export default Header;