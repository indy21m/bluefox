import { useEffect } from 'react';

export const ClickDebug = () => {
  useEffect(() => {
    // Debug click events
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log('Click event:', {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.innerText?.substring(0, 50),
        parent: target.parentElement?.tagName,
        isButton: target.tagName === 'BUTTON' || target.closest('button'),
        isLink: target.tagName === 'A' || target.closest('a'),
        path: e.composedPath().map((el: any) => el.tagName).filter(Boolean).join(' > ')
      });
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
};

export default ClickDebug;