import { useToast as useNewToast } from '../design-system';

// Compatibility wrapper for the old toast API
export const useToast = () => {
  const toast = useNewToast();
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  };
  
  return { showToast };
};