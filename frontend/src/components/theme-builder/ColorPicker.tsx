import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTempColor(value);
  }, [value]);

  const presetColors = [
    '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827', '#000000',
    '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D',
    '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12',
    '#FEFCE8', '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#854D0E', '#713F12',
    '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D',
    '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A',
    '#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E',
    '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A',
    '#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95',
    '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87',
    '#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843',
  ];

  const handleColorChange = (color: string) => {
    setTempColor(color);
    onChange(color);
  };

  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          border: '1px solid var(--gray-300)',
          borderRadius: '6px',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-400)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-300)';
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: value,
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        />
        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--gray-700)' }}>
          {value.toUpperCase()}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              padding: '16px',
              zIndex: 1000,
              minWidth: '280px',
            }}
          >
            {/* Custom Color Input */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--gray-700)',
                }}
              >
                Custom Color
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={inputRef}
                  type="color"
                  value={tempColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  style={{
                    width: '50px',
                    height: '36px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                />
                <input
                  type="text"
                  value={tempColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                      handleColorChange(color);
                    } else {
                      setTempColor(color);
                    }
                  }}
                  onBlur={() => {
                    if (/^#[0-9A-F]{6}$/i.test(tempColor)) {
                      onChange(tempColor);
                    } else {
                      setTempColor(value);
                    }
                  }}
                  placeholder="#000000"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--gray-700)',
                }}
              >
                Preset Colors
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '4px',
                }}
              >
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      handleColorChange(color);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      padding: 0,
                      border: value === color ? '2px solid var(--primary)' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Recent Colors */}
            <div style={{ marginTop: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: 'var(--gray-700)',
                }}
              >
                Recently Used
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {getRecentColors().map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => {
                      handleColorChange(color);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      padding: 0,
                      border: value === color ? '2px solid var(--primary)' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get recent colors from localStorage
const getRecentColors = (): string[] => {
  const stored = localStorage.getItem('bluefox_recent_colors');
  if (!stored) return ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#10B981'];
  
  try {
    return JSON.parse(stored).slice(0, 8);
  } catch {
    return ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#10B981'];
  }
};

// Helper function to save recent color
const saveRecentColor = (color: string) => {
  const recent = getRecentColors();
  const filtered = recent.filter(c => c !== color);
  const updated = [color, ...filtered].slice(0, 8);
  localStorage.setItem('bluefox_recent_colors', JSON.stringify(updated));
};

export default ColorPicker;