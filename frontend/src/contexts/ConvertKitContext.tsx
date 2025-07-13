import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CustomField {
  id: number;
  name: string;
  key: string;
  label: string;
}

interface ConvertKitContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  connectionStatus: 'disconnected' | 'connected' | 'error';
  setConnectionStatus: (status: 'disconnected' | 'connected' | 'error') => void;
  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;
  clearConnection: () => void;
  isLoading: boolean;
}

const ConvertKitContext = createContext<ConvertKitContextType | undefined>(undefined);

export const useConvertKit = () => {
  const context = useContext(ConvertKitContext);
  if (!context) {
    throw new Error('useConvertKit must be used within a ConvertKitProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  API_KEY: 'bluefox_convertkit_api_key',
  CONNECTION_STATUS: 'bluefox_convertkit_status',
  CUSTOM_FIELDS: 'bluefox_convertkit_fields',
  LAST_VERIFIED: 'bluefox_convertkit_last_verified'
};

export const ConvertKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [connectionStatus, setConnectionStatusState] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [customFields, setCustomFieldsState] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        const savedStatus = localStorage.getItem(STORAGE_KEYS.CONNECTION_STATUS) as 'disconnected' | 'connected' | 'error';
        const savedFields = localStorage.getItem(STORAGE_KEYS.CUSTOM_FIELDS);
        const lastVerified = localStorage.getItem(STORAGE_KEYS.LAST_VERIFIED);

        if (savedApiKey) {
          setApiKeyState(savedApiKey);
        }

        // Check if the saved connection is still valid (verified within last 24 hours)
        if (savedStatus && lastVerified) {
          const lastVerifiedTime = new Date(lastVerified).getTime();
          const now = new Date().getTime();
          const hoursSinceVerified = (now - lastVerifiedTime) / (1000 * 60 * 60);
          
          if (hoursSinceVerified < 24) {
            setConnectionStatusState(savedStatus);
            if (savedFields) {
              setCustomFieldsState(JSON.parse(savedFields));
            }
          } else {
            // Connection data is stale, clear it
            localStorage.removeItem(STORAGE_KEYS.CONNECTION_STATUS);
            localStorage.removeItem(STORAGE_KEYS.CUSTOM_FIELDS);
            localStorage.removeItem(STORAGE_KEYS.LAST_VERIFIED);
          }
        }
      } catch (error) {
        console.error('Error loading ConvertKit data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }, []);

  const setConnectionStatus = useCallback((status: 'disconnected' | 'connected' | 'error') => {
    setConnectionStatusState(status);
    localStorage.setItem(STORAGE_KEYS.CONNECTION_STATUS, status);
    
    if (status === 'connected') {
      localStorage.setItem(STORAGE_KEYS.LAST_VERIFIED, new Date().toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_VERIFIED);
    }
  }, []);

  const setCustomFields = useCallback((fields: CustomField[]) => {
    setCustomFieldsState(fields);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FIELDS, JSON.stringify(fields));
  }, []);

  const clearConnection = useCallback(() => {
    setApiKeyState('');
    setConnectionStatusState('disconnected');
    setCustomFieldsState([]);
    
    // Clear all stored data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  return (
    <ConvertKitContext.Provider value={{
      apiKey,
      setApiKey,
      connectionStatus,
      setConnectionStatus,
      customFields,
      setCustomFields,
      clearConnection,
      isLoading
    }}>
      {children}
    </ConvertKitContext.Provider>
  );
};