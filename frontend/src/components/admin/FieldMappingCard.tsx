import React, { useState, useEffect } from 'react';
import { Button, GlassCard, Input } from '../common';
import { useConvertKit } from '../../contexts/ConvertKitContext';
import { useToast } from '../../contexts/ToastContext';
import type { Question, AnswerOption } from '../../types';

interface FieldMappingCardProps {
  question: Question;
  onUpdateQuestion: (updatedQuestion: Question) => void;
}

const FieldMappingCard: React.FC<FieldMappingCardProps> = ({ question, onUpdateQuestion }) => {
  const { customFields, connectionStatus } = useConvertKit();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldMapping = (fieldKey: string) => {
    const updatedQuestion = {
      ...question,
      convertKitField: fieldKey || undefined
    };
    onUpdateQuestion(updatedQuestion);
    showToast(`Question mapped to ConvertKit field: ${fieldKey}`, 'success');
  };

  const handleOptionMapping = (optionId: string, fieldValue: string) => {
    if (!question.options) return;
    
    const updatedOptions = question.options.map(option => 
      option.id === optionId 
        ? { ...option, convertKitFieldValue: fieldValue || undefined }
        : option
    );
    
    const updatedQuestion = {
      ...question,
      options: updatedOptions
    };
    onUpdateQuestion(updatedQuestion);
    showToast(`Answer option mapped to field value: ${fieldValue}`, 'success');
  };

  const getFieldLabel = (fieldKey: string) => {
    const field = customFields.find(f => f.key === fieldKey);
    return field ? field.label : fieldKey;
  };

  const getMappingStatus = () => {
    if (connectionStatus !== 'connected') {
      return 'Connect to ConvertKit first';
    }
    
    if (!question.convertKitField) {
      return 'Not mapped';
    }

    if (question.type === 'multiple_choice') {
      const mappedOptions = question.options?.filter(opt => opt.convertKitFieldValue) || [];
      return `Mapped to ${getFieldLabel(question.convertKitField)} (${mappedOptions.length}/${question.options?.length || 0} options)`;
    }

    return `Mapped to ${getFieldLabel(question.convertKitField)}`;
  };

  const getMappingStatusColor = () => {
    if (connectionStatus !== 'connected') return 'var(--gray-500)';
    if (!question.convertKitField) return 'var(--error)';
    
    if (question.type === 'multiple_choice') {
      const mappedOptions = question.options?.filter(opt => opt.convertKitFieldValue) || [];
      const allMapped = mappedOptions.length === (question.options?.length || 0);
      return allMapped ? 'var(--success)' : 'var(--warning)';
    }

    return 'var(--success)';
  };

  if (connectionStatus !== 'connected') {
    return (
      <GlassCard style={{ marginBottom: '16px', opacity: 0.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 className="font-medium" style={{ marginBottom: '4px' }}>
              Q{question.order}: {question.title}
            </h4>
            <p className="text-sm text-gray-600">Connect to ConvertKit to map fields</p>
          </div>
          <span className="text-sm text-gray-500">Not connected</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h4 className="font-medium" style={{ marginBottom: '4px' }}>
            Q{question.order}: {question.title}
          </h4>
          <p className="text-sm" style={{ color: getMappingStatusColor() }}>
            {getMappingStatus()}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Configure'}
        </Button>
      </div>

      {isExpanded && (
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--gray-200)' }}>
          {/* Main Field Mapping */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Map to ConvertKit Field</label>
            <select
              value={question.convertKitField || ''}
              onChange={(e) => handleFieldMapping(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                backgroundColor: 'white',
                color: 'var(--gray-800)'
              }}
            >
              <option value="">Select a field...</option>
              {customFields.map(field => (
                <option key={field.id} value={field.key}>
                  {field.label} ({field.key})
                </option>
              ))}
            </select>
            {question.convertKitField && (
              <p className="text-xs text-gray-600" style={{ marginTop: '4px' }}>
                Answers to this question will update the "{getFieldLabel(question.convertKitField)}" field in ConvertKit
              </p>
            )}
          </div>

          {/* Multiple Choice Option Mapping */}
          {question.type === 'multiple_choice' && question.convertKitField && (
            <div>
              <h5 className="font-medium" style={{ marginBottom: '12px' }}>
                Map Answer Options to Field Values
              </h5>
              <div className="grid gap-sm">
                {question.options?.map((option: AnswerOption) => (
                  <div key={option.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: 'var(--gray-50)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="text-sm font-medium">{option.text}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Input
                        value={option.convertKitFieldValue || ''}
                        onChange={(e) => handleOptionMapping(option.id, e.target.value)}
                        placeholder="Field value..."
                        size="sm"
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600" style={{ marginTop: '8px' }}>
                When users select an answer, the corresponding field value will be set in ConvertKit
              </p>
            </div>
          )}

          {/* Non-Multiple Choice Field Value Preview */}
          {question.type !== 'multiple_choice' && question.convertKitField && (
            <div style={{ 
              padding: '12px',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--gray-200)'
            }}>
              <p className="text-sm text-gray-700">
                <strong>Field Value:</strong> User's {question.type} input will be stored directly
              </p>
              {question.type === 'boolean' && (
                <p className="text-xs text-gray-600" style={{ marginTop: '4px' }}>
                  True/False will be stored as "true" or "false"
                </p>
              )}
              {question.type === 'scale' && (
                <p className="text-xs text-gray-600" style={{ marginTop: '4px' }}>
                  Scale value ({question.minValue || 1} - {question.maxValue || 10}) will be stored as number
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default FieldMappingCard;