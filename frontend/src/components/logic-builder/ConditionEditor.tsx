import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Condition, Question } from '../../types';

interface ConditionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sourceQuestion: Question | null;
  onSave: (conditions: Condition[], operator: 'AND' | 'OR') => void;
  initialConditions?: Condition[];
  initialOperator?: 'AND' | 'OR';
}

const ConditionEditor = ({
  isOpen,
  onClose,
  sourceQuestion,
  onSave,
  initialConditions = [],
  initialOperator = 'AND'
}: ConditionEditorProps) => {
  const [conditions, setConditions] = useState<Condition[]>(
    initialConditions.length > 0 ? initialConditions : [{
      id: `condition_${Date.now()}`,
      operator: 'equals',
      value: ''
    }]
  );
  const [operator, setOperator] = useState<'AND' | 'OR'>(initialOperator);

  if (!sourceQuestion) return null;

  const getOperatorOptions = () => {
    switch (sourceQuestion.type) {
      case 'multiple_choice':
        return [
          { value: 'equals', label: 'is' },
          { value: 'not_equals', label: 'is not' },
          { value: 'in', label: 'is one of' },
          { value: 'not_in', label: 'is not one of' }
        ];
      case 'text':
      case 'email':
        return [
          { value: 'equals', label: 'equals' },
          { value: 'not_equals', label: 'does not equal' },
          { value: 'contains', label: 'contains' },
          { value: 'is_empty', label: 'is empty' },
          { value: 'is_not_empty', label: 'is not empty' }
        ];
      case 'number':
      case 'scale':
        return [
          { value: 'equals', label: 'equals' },
          { value: 'not_equals', label: 'does not equal' },
          { value: 'greater_than', label: 'is greater than' },
          { value: 'less_than', label: 'is less than' }
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'is' }
        ];
      default:
        return [{ value: 'equals', label: 'equals' }];
    }
  };

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        id: `condition_${Date.now()}`,
        operator: 'equals',
        value: ''
      }
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const handleConditionChange = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const handleSave = () => {
    const validConditions = conditions.filter(c => 
      c.value !== '' || c.operator === 'is_empty' || c.operator === 'is_not_empty'
    );
    onSave(validConditions, operator);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 1001
            }}
          >
            <h3 className="h3" style={{ marginBottom: '24px' }}>
              Edit Conditions
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: 'var(--gray-50)', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <span style={{ fontWeight: '500' }}>When: </span>
                "{sourceQuestion.title}"
              </div>

              {/* Operator selector for multiple conditions */}
              {conditions.length > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Condition Logic</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setOperator('AND')}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${operator === 'AND' ? 'var(--primary)' : 'var(--gray-300)'}`,
                        borderRadius: '8px',
                        background: operator === 'AND' ? 'var(--primary)' : 'white',
                        color: operator === 'AND' ? 'white' : 'var(--gray-700)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      All conditions (AND)
                    </button>
                    <button
                      onClick={() => setOperator('OR')}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${operator === 'OR' ? 'var(--primary)' : 'var(--gray-300)'}`,
                        borderRadius: '8px',
                        background: operator === 'OR' ? 'var(--primary)' : 'white',
                        color: operator === 'OR' ? 'white' : 'var(--gray-700)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Any condition (OR)
                    </button>
                  </div>
                </div>
              )}

              {/* Conditions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conditions.map((condition, index) => (
                  <div 
                    key={condition.id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <select
                          value={condition.operator}
                          onChange={(e) => handleConditionChange(condition.id, { 
                            operator: e.target.value as any,
                            value: (e.target.value === 'is_empty' || e.target.value === 'is_not_empty') ? true : condition.value
                          })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--gray-300)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            marginBottom: '8px'
                          }}
                        >
                          {getOperatorOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {/* Value input based on question type */}
                        {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
                          <>
                            {sourceQuestion.type === 'multiple_choice' && sourceQuestion.options ? (
                              <select
                                value={condition.value || ''}
                                onChange={(e) => handleConditionChange(condition.id, { value: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              >
                                <option value="">Select an option</option>
                                {sourceQuestion.options.map(option => (
                                  <option key={option.id} value={option.value}>
                                    {option.text}
                                  </option>
                                ))}
                              </select>
                            ) : sourceQuestion.type === 'boolean' ? (
                              <select
                                value={condition.value || ''}
                                onChange={(e) => handleConditionChange(condition.id, { value: e.target.value === 'true' })}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              >
                                <option value="">Select value</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            ) : sourceQuestion.type === 'number' || sourceQuestion.type === 'scale' ? (
                              <input
                                type="number"
                                value={condition.value || ''}
                                onChange={(e) => handleConditionChange(condition.id, { value: Number(e.target.value) })}
                                placeholder="Enter a number"
                                min={sourceQuestion.minValue}
                                max={sourceQuestion.maxValue}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            ) : (
                              <input
                                type="text"
                                value={condition.value || ''}
                                onChange={(e) => handleConditionChange(condition.id, { value: e.target.value })}
                                placeholder="Enter value"
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>

                      {conditions.length > 1 && (
                        <button
                          onClick={() => handleRemoveCondition(condition.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            padding: '8px',
                            fontSize: '20px',
                            lineHeight: '1'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {conditions.length > 1 && index < conditions.length - 1 && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '12px',
                        fontSize: '12px',
                        color: 'var(--gray-500)',
                        fontWeight: '600'
                      }}>
                        {operator}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleAddCondition}
                style={{ marginTop: '12px' }}
              >
                <span>+ Add Condition</span>
              </button>
            </div>

            {/* Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--gray-200)'
            }}>
              <button className="btn btn-secondary" onClick={onClose}>
                <span>Cancel</span>
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <span>Save Conditions</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConditionEditor;