import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, User, LoginCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored authentication on mount
    const checkStoredAuth = () => {
      const storedUser = localStorage.getItem('bluefox_user');
      const storedToken = localStorage.getItem('bluefox_token');
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('bluefox_user');
          localStorage.removeItem('bluefox_token');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials check
      if (credentials.email === 'admin@bluefox.com' && credentials.password === 'password') {
        const user: User = {
          id: 'admin_1',
          email: credentials.email,
          name: 'BlueFox Admin',
          role: 'admin',
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date()
        };

        const token = `token_${Date.now()}`;

        // Store authentication
        localStorage.setItem('bluefox_user', JSON.stringify(user));
        localStorage.setItem('bluefox_token', token);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid email or password'
        });
        return false;
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed. Please try again.'
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('bluefox_user');
    localStorage.removeItem('bluefox_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};