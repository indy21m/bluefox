import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { SurveyTheme, ThemePreset } from '../../types';
import { defaultThemes } from '../../types/theme';
import ThemePreview from './ThemePreview';
import ColorPicker from './ColorPicker';
import { checkContrastRatio } from '../../utils/accessibility';

interface ThemeEditorProps {
  surveyId: string;
  onSave: (theme: SurveyTheme) => void;
  onClose: () => void;
}

const ThemeEditor = ({ surveyId, onSave, onClose }: ThemeEditorProps) => {
  const [activeTheme, setActiveTheme] = useState<SurveyTheme>(() => {
    // Load saved theme or use default
    const savedTheme = localStorage.getItem(`bluefox_theme_${surveyId}`);
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
    
    return {
      id: `theme_${Date.now()}`,
      name: 'Plain',
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaultThemes.plain,
    } as SurveyTheme;
  });

  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['theme', 'structure']));
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>('plain');
  const [isDirty, setIsDirty] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateTheme = (updates: Partial<SurveyTheme>) => {
    setActiveTheme(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  };

  const updateStructure = (key: keyof SurveyTheme['structure'], value: number) => {
    updateTheme({
      structure: {
        ...activeTheme.structure,
        [key]: value,
      },
    });
  };

  const updateTypography = (updates: Partial<SurveyTheme['typography']>) => {
    updateTheme({
      typography: {
        ...activeTheme.typography,
        ...updates,
      },
    });
  };

  const updateFontSize = (key: keyof SurveyTheme['typography']['fontSize'], value: number) => {
    updateTheme({
      typography: {
        ...activeTheme.typography,
        fontSize: {
          ...activeTheme.typography.fontSize,
          [key]: value,
        },
      },
    });
  };

  const updateColor = (key: keyof SurveyTheme['colors'], value: string) => {
    updateTheme({
      colors: {
        ...activeTheme.colors,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: keyof SurveyTheme['style'], value: any) => {
    updateTheme({
      style: {
        ...activeTheme.style,
        [key]: value,
      },
    });
  };

  const applyPreset = (preset: ThemePreset) => {
    if (preset === 'custom') return;
    
    const presetTheme = defaultThemes[preset];
    setActiveTheme(prev => ({
      ...prev,
      ...presetTheme,
      name: presetTheme.name || preset,
      isCustom: false,
    }));
    setSelectedPreset(preset);
    setIsDirty(true);
  };

  const handleSave = () => {
    const themeToSave = {
      ...activeTheme,
      isCustom: selectedPreset === 'custom',
    };
    
    localStorage.setItem(`bluefox_theme_${surveyId}`, JSON.stringify(themeToSave));
    onSave(themeToSave);
    setIsDirty(false);
  };

  const fonts = [
    'Inter, system-ui, sans-serif',
    'Arial, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Playfair Display, serif',
    'Raleway, sans-serif',
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: '90vw',
          height: '90vh',
          maxWidth: '1400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 className="h3">Visual Theme Editor</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{
                position: 'relative',
              }}
            >
              Save Theme
              {isDirty && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: 'var(--error)',
                  borderRadius: '50%',
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}>
          {/* Left Panel - Controls */}
          <div style={{
            width: '400px',
            borderRight: '1px solid var(--gray-200)',
            overflowY: 'auto',
            backgroundColor: 'var(--gray-50)',
          }}>
            {/* Theme Presets Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('theme')}
                className="section-header"
              >
                {expandedSections.has('theme') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Theme</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('theme') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {(['plain', 'modern', 'dark', 'custom'] as ThemePreset[]).map(preset => (
                        <button
                          key={preset}
                          onClick={() => preset !== 'custom' && applyPreset(preset)}
                          className={`theme-preset ${selectedPreset === preset ? 'active' : ''}`}
                          disabled={preset === 'custom' && !activeTheme.isCustom}
                        >
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Structure Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('structure')}
                className="section-header"
              >
                {expandedSections.has('structure') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Structure</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('structure') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    {Object.entries({
                      widgetBorderRadius: 'Widget Border Radius',
                      widgetBorderWidth: 'Widget Border Width',
                      buttonBorderRadius: 'Button Border Radius',
                      gapBetweenButtons: 'Gap Between Buttons',
                      gapBetweenFormFields: 'Gap Between Form Fields',
                      formMaxWidth: 'Form Max Width',
                    }).map(([key, label]) => (
                      <div key={key} className="control-group">
                        <label>{label}</label>
                        <div className="slider-control">
                          <input
                            type="range"
                            min={key === 'formMaxWidth' ? 300 : 0}
                            max={key === 'formMaxWidth' ? 1200 : key.includes('Border') ? 50 : 100}
                            value={activeTheme.structure[key as keyof typeof activeTheme.structure]}
                            onChange={(e) => updateStructure(key as keyof typeof activeTheme.structure, Number(e.target.value))}
                          />
                          <input
                            type="number"
                            value={activeTheme.structure[key as keyof typeof activeTheme.structure]}
                            onChange={(e) => updateStructure(key as keyof typeof activeTheme.structure, Number(e.target.value))}
                            className="px-input"
                          />
                          <span className="px-label">px</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Typography Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('typography')}
                className="section-header"
              >
                {expandedSections.has('typography') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Typography</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('typography') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    <div className="control-group">
                      <label>Font Family</label>
                      <select
                        value={activeTheme.typography.fontFamily}
                        onChange={(e) => updateTypography({ fontFamily: e.target.value })}
                        className="font-select"
                      >
                        {fonts.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font.split(',')[0]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Line Height</label>
                      <div className="slider-control">
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={activeTheme.typography.lineHeight}
                          onChange={(e) => updateTypography({ lineHeight: Number(e.target.value) })}
                        />
                        <input
                          type="number"
                          value={activeTheme.typography.lineHeight}
                          onChange={(e) => updateTypography({ lineHeight: Number(e.target.value) })}
                          step="0.1"
                          className="px-input"
                          style={{ width: '60px' }}
                        />
                      </div>
                    </div>

                    {Object.entries({
                      headline: 'Headline',
                      description: 'Description',
                      answerOption: 'Answer Option',
                      formField: 'Form Field',
                      submitButton: 'Submit Button',
                    }).map(([key, label]) => (
                      <div key={key} className="control-group">
                        <label>{label} Size</label>
                        <div className="slider-control">
                          <input
                            type="range"
                            min="10"
                            max="48"
                            value={activeTheme.typography.fontSize[key as keyof typeof activeTheme.typography.fontSize]}
                            onChange={(e) => updateFontSize(key as keyof typeof activeTheme.typography.fontSize, Number(e.target.value))}
                          />
                          <input
                            type="number"
                            value={activeTheme.typography.fontSize[key as keyof typeof activeTheme.typography.fontSize]}
                            onChange={(e) => updateFontSize(key as keyof typeof activeTheme.typography.fontSize, Number(e.target.value))}
                            className="px-input"
                          />
                          <span className="px-label">px</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Colors Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('colors')}
                className="section-header"
              >
                {expandedSections.has('colors') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Colors</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('colors') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    {Object.entries({
                      background: 'Background',
                      textOnBackground: 'Text on Background',
                      buttonColor: 'Button Color',
                      textOnButtons: 'Text on Buttons',
                      borderColor: 'Border Color',
                      primaryAccent: 'Primary Accent',
                      successColor: 'Success Color',
                      errorColor: 'Error Color',
                    }).map(([key, label]) => (
                      <div key={key} className="control-group">
                        <label>
                          {label}
                          {/* Contrast warning for button/text combinations */}
                          {key === 'textOnButtons' && (
                            <ContrastWarning
                              foreground={activeTheme.colors.textOnButtons}
                              background={activeTheme.colors.buttonColor}
                            />
                          )}
                          {key === 'textOnBackground' && (
                            <ContrastWarning
                              foreground={activeTheme.colors.textOnBackground}
                              background={activeTheme.colors.background}
                            />
                          )}
                        </label>
                        <ColorPicker
                          value={activeTheme.colors[key as keyof typeof activeTheme.colors]}
                          onChange={(color) => updateColor(key as keyof typeof activeTheme.colors, color)}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Style Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('style')}
                className="section-header"
              >
                {expandedSections.has('style') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Style</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('style') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    <div className="control-group">
                      <label>Submit Button Animation</label>
                      <select
                        value={activeTheme.style.submitButtonAnimation}
                        onChange={(e) => updateStyle('submitButtonAnimation', e.target.value)}
                        className="style-select"
                      >
                        <option value="none">None</option>
                        <option value="pulse">Pulse</option>
                        <option value="shake">Shake</option>
                        <option value="bounce">Bounce</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Transition Speed</label>
                      <select
                        value={activeTheme.style.transitionSpeed}
                        onChange={(e) => updateStyle('transitionSpeed', e.target.value)}
                        className="style-select"
                      >
                        <option value="instant">Instant</option>
                        <option value="fast">Fast</option>
                        <option value="normal">Normal</option>
                        <option value="slow">Slow</option>
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Box Shadow</label>
                      <select
                        value={activeTheme.style.boxShadow}
                        onChange={(e) => updateStyle('boxShadow', e.target.value)}
                        className="style-select"
                      >
                        <option value="none">None</option>
                        <option value="subtle">Subtle</option>
                        <option value="medium">Medium</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom CSS Section */}
            <div className="editor-section">
              <button
                onClick={() => toggleSection('custom-css')}
                className="section-header"
              >
                {expandedSections.has('custom-css') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>Custom CSS</span>
              </button>
              
              <AnimatePresence>
                {expandedSections.has('custom-css') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="section-content"
                  >
                    <textarea
                      value={activeTheme.customCSS || ''}
                      onChange={(e) => updateTheme({ customCSS: e.target.value })}
                      placeholder="/* Add your custom CSS here */"
                      className="custom-css-editor"
                      spellCheck={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: activeTheme.colors.background,
          }}>
            {/* Preview Controls */}
            <div style={{
              padding: '16px 24px',
              backgroundColor: 'white',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`preview-mode-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                title="Desktop View"
              >
                <Monitor size={20} />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`preview-mode-btn ${previewMode === 'tablet' ? 'active' : ''}`}
                title="Tablet View"
              >
                <Tablet size={20} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`preview-mode-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                title="Mobile View"
              >
                <Smartphone size={20} />
              </button>
            </div>

            {/* Preview Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              overflow: 'auto',
            }}>
              <ThemePreview
                theme={activeTheme}
                mode={previewMode}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .editor-section {
          border-bottom: 1px solid var(--gray-200);
        }

        .section-header {
          width: 100%;
          padding: 16px 20px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .section-header:hover {
          background-color: var(--gray-100);
        }

        .section-content {
          padding: 0 20px 20px;
          overflow: hidden;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 8px;
        }

        .slider-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slider-control input[type="range"] {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--gray-200);
          border-radius: 3px;
          outline: none;
        }

        .slider-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .px-input {
          width: 50px;
          padding: 4px 8px;
          border: 1px solid var(--gray-300);
          border-radius: 4px;
          font-size: 12px;
          text-align: center;
        }

        .px-label {
          font-size: 12px;
          color: var(--gray-500);
        }

        .font-select,
        .style-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          font-size: 14px;
          background-color: white;
        }

        .theme-preset {
          padding: 8px 16px;
          border: 2px solid var(--gray-200);
          border-radius: 8px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-preset:hover:not(:disabled) {
          border-color: var(--primary);
          transform: translateY(-1px);
        }

        .theme-preset.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .theme-preset:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .preview-mode-btn {
          padding: 8px 12px;
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-mode-btn:hover {
          background: var(--gray-50);
        }

        .preview-mode-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .custom-css-editor {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid var(--gray-300);
          border-radius: 6px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
        }
      `}</style>
    </div>
  );
};

// Contrast Warning Component
const ContrastWarning = ({ foreground, background }: { foreground: string; background: string }) => {
  const ratio = checkContrastRatio(foreground, background);
  const passes = ratio >= 4.5; // WCAG AA standard

  if (passes) return null;

  return (
    <span
      style={{
        marginLeft: '8px',
        padding: '2px 6px',
        backgroundColor: 'var(--warning-light)',
        color: 'var(--warning)',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'normal',
      }}
      title={`Contrast ratio: ${ratio.toFixed(2)}. Minimum recommended: 4.5`}
    >
      ⚠️ Low contrast
    </span>
  );
};

export default ThemeEditor;