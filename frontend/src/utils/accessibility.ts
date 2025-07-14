// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
export const checkContrastRatio = (foreground: string, background: string): number => {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

// Check if contrast ratio meets WCAG standards
export const meetsWCAGStandard = (
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  fontSize: 'normal' | 'large' = 'normal'
): boolean => {
  if (level === 'AA') {
    return fontSize === 'normal' ? ratio >= 4.5 : ratio >= 3;
  } else {
    return fontSize === 'normal' ? ratio >= 7 : ratio >= 4.5;
  }
};

// Get a readable color for a given background
export const getReadableTextColor = (backgroundColor: string): string => {
  const bg = hexToRgb(backgroundColor);
  const luminance = getLuminance(bg.r, bg.g, bg.b);
  
  // If background is dark, use white text, otherwise use black
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Suggest a better color if contrast is too low
export const suggestBetterContrast = (
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string => {
  const currentRatio = checkContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground; // Already good
  }

  const bg = hexToRgb(background);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);
  
  // If background is dark, lighten the foreground; if light, darken it
  if (bgLuminance < 0.5) {
    // Background is dark, so we need a lighter foreground
    return '#FFFFFF';
  } else {
    // Background is light, so we need a darker foreground
    return '#000000';
  }
};