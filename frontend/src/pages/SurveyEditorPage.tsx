import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header, Button, GlassCard, Input } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useConvertKit } from '../contexts/ConvertKitContext';
import type { Survey, Question, AnswerOption, ConditionalLogic } from '../types';
import { demoSurvey } from '../data/demoSurvey';

const SurveyEditorPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { connectionStatus, customFields } = useConvertKit();
  
  const [survey, setSurvey] = useState<Survey>(demoSurvey);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'kit-sync' | 'logic'>('overview');
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);

  useEffect(() => {
    if (surveyId === 'demo') {
      // Try to load saved survey from localStorage first
      const savedSurvey = localStorage.getItem(`bluefox_survey_${surveyId}`);
      if (savedSurvey) {
        try {
          const parsedSurvey = JSON.parse(savedSurvey);
          setSurvey(parsedSurvey);
          if (parsedSurvey.questions.length > 0) {
            setSelectedQuestion(parsedSurvey.questions[0]);
          }
        } catch (error) {
          // If parsing fails, use demo survey
          setSurvey(demoSurvey);
          if (demoSurvey.questions.length > 0) {
            setSelectedQuestion(demoSurvey.questions[0]);
          }
        }
      } else {
        // No saved survey, use demo survey
        setSurvey(demoSurvey);
        if (demoSurvey.questions.length > 0) {
          setSelectedQuestion(demoSurvey.questions[0]);
        }
      }
    }
  }, [surveyId]);

  const handleLogout = () => {
    logout();
  };

  const handleSurveyTitleChange = (title: string) => {
    setSurvey({ ...survey, title });
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<Question>) => {
    setSurvey({
      ...survey,
      questions: survey.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
    
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion({ ...selectedQuestion, ...updates });
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type: 'multiple_choice',
      title: 'New Question',
      required: true,
      options: [
        { id: `option_${Date.now()}_1`, text: 'Option 1', value: 'option1' },
        { id: `option_${Date.now()}_2`, text: 'Option 2', value: 'option2' }
      ],
      order: survey.questions.length + 1
    };
    
    const updatedSurvey = {
      ...survey,
      questions: [...survey.questions, newQuestion]
    };
    
    setSurvey(updatedSurvey);
    setSelectedQuestion(newQuestion);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
  };

  const confirmDeleteQuestion = () => {
    if (questionToDelete) {
      const updatedQuestions = survey.questions.filter(q => q.id !== questionToDelete);
      setSurvey({ ...survey, questions: updatedQuestions });
      
      if (selectedQuestion?.id === questionToDelete) {
        setSelectedQuestion(updatedQuestions[0] || null);
      }
      
      setQuestionToDelete(null);
      showToast('Question deleted successfully', 'success');
    }
  };

  const cancelDeleteQuestion = () => {
    setQuestionToDelete(null);
  };

  const handleAddLogicRule = () => {
    if (!selectedQuestion) return;
    
    const newLogic: ConditionalLogic = {
      condition: 'equals',
      value: '',
      nextQuestionId: null
    };
    
    const updatedLogic = [...(selectedQuestion.conditionalLogic || []), newLogic];
    handleQuestionUpdate(selectedQuestion.id, { conditionalLogic: updatedLogic });
  };

  const handleUpdateLogicRule = (index: number, updates: Partial<ConditionalLogic>) => {
    if (!selectedQuestion || !selectedQuestion.conditionalLogic) return;
    
    const updatedLogic = selectedQuestion.conditionalLogic.map((logic, i) => 
      i === index ? { ...logic, ...updates } : logic
    );
    
    handleQuestionUpdate(selectedQuestion.id, { conditionalLogic: updatedLogic });
  };

  const handleDeleteLogicRule = (index: number) => {
    if (!selectedQuestion || !selectedQuestion.conditionalLogic) return;
    
    const updatedLogic = selectedQuestion.conditionalLogic.filter((_, i) => i !== index);
    handleQuestionUpdate(selectedQuestion.id, { conditionalLogic: updatedLogic });
    showToast('Logic rule deleted', 'success');
  };

  const handleReorderQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = survey.questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= survey.questions.length) return;
    
    const reorderedQuestions = [...survey.questions];
    [reorderedQuestions[currentIndex], reorderedQuestions[newIndex]] = 
      [reorderedQuestions[newIndex], reorderedQuestions[currentIndex]];
    
    // Update order numbers
    reorderedQuestions.forEach((q, index) => {
      q.order = index + 1;
    });
    
    setSurvey({ ...survey, questions: reorderedQuestions });
  };

  const handleSaveSurvey = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for now (until we have backend CRUD)
      localStorage.setItem(`bluefox_survey_${surveyId}`, JSON.stringify(survey));
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Survey saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save survey', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Header 
        rightContent={
          <div className="flex items-center gap-md">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        }
      />
      
      <main className="container" style={{ paddingTop: '40px', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <Input
                type="text"
                value={survey.title}
                onChange={(e) => handleSurveyTitleChange(e.target.value)}
                style={{ fontSize: '28px', fontWeight: 'bold', border: 'none', background: 'transparent', padding: 0 }}
                placeholder="Survey Title..."
              />
            </div>
            <div className="flex gap-md">
              <Link to="/admin/surveys">
                <Button variant="secondary">← Back to Surveys</Button>
              </Link>
              <Link to={`/survey/${surveyId}`} target="_blank">
                <Button variant="secondary">
                  🔍 Test Survey
                </Button>
              </Link>
              <Button 
                variant="primary" 
                onClick={handleSaveSurvey}
                loading={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Survey'}
              </Button>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Configure questions, field mappings, and conditional logic
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg" style={{ width: '100%' }}>
          {/* Question List */}
          <div>
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="h3">Questions ({survey.questions.length})</h3>
                <Button variant="primary" size="sm" onClick={handleAddQuestion}>
                  + Add
                </Button>
              </div>
              
              <div className="grid gap-sm">
                {survey.questions
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => (
                  <div
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    style={{
                      padding: '12px',
                      border: `2px solid ${selectedQuestion?.id === question.id ? 'var(--primary-blue)' : 'var(--gray-200)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedQuestion?.id === question.id ? 'var(--gray-50)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="font-medium text-sm">Q{index + 1}: {question.title}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-xs">
                          <span>{question.type}</span>
                          {connectionStatus === 'connected' && question.convertKitField && (
                            <span style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              backgroundColor: 'var(--success)',
                              display: 'inline-block' 
                            }}></span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderQuestion(question.id, 'up');
                          }}
                          disabled={index === 0}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            opacity: index === 0 ? 0.3 : 1,
                            padding: '4px'
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderQuestion(question.id, 'down');
                          }}
                          disabled={index === survey.questions.length - 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: index === survey.questions.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: index === survey.questions.length - 1 ? 0.3 : 1,
                            padding: '4px'
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Question Editor */}
          <div style={{ gridColumn: 'span 2' }}>
            {selectedQuestion ? (
              <GlassCard>

                {/* Tab Navigation */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--gray-200)', 
                  marginBottom: '24px',
                  gap: '0'
                }}>
                  <div style={{ display: 'flex', gap: '0' }}>
                  {[
                    { id: 'overview', label: '📝 Overview' },
                    { id: 'kit-sync', label: '🔗 Sync with Kit' },
                    { id: 'logic', label: '🔀 Conditional Logic' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'overview' | 'kit-sync' | 'logic')}
                      style={{
                        padding: '12px 20px',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeTab === tab.id ? '2px solid var(--primary-blue)' : '2px solid transparent',
                        color: activeTab === tab.id ? 'var(--primary-blue)' : 'var(--gray-600)',
                        fontWeight: activeTab === tab.id ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                      {tab.id === 'kit-sync' && connectionStatus === 'connected' && selectedQuestion.convertKitField && (
                        <span style={{ 
                          marginLeft: '6px', 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--success)',
                          display: 'inline-block' 
                        }}></span>
                      )}
                    </button>
                  ))}
                  </div>
                  
                  {/* Delete Question Button */}
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                    style={{ 
                      color: 'var(--error)', 
                      border: '1px solid var(--error)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    🗑️ Delete Question
                  </Button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="grid gap-lg">
                    {/* Question Title */}
                    <div>
                      <label className="form-label">Question Title</label>
                      <Input
                        type="text"
                        value={selectedQuestion.title}
                        onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { title: e.target.value })}
                        placeholder="Enter question title..."
                      />
                    </div>

                    {/* Question Description */}
                    <div>
                      <label className="form-label">Description (optional)</label>
                      <Input
                        type="text"
                        value={selectedQuestion.description ?? ''}
                        onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { description: e.target.value })}
                        placeholder="Add helpful context..."
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="form-label">Question Type</label>
                      <select
                        value={selectedQuestion.type}
                        onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { type: e.target.value as Question['type'] })}
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
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="text">Text Input</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="boolean">Yes/No</option>
                        <option value="scale">Scale (1-10)</option>
                      </select>
                    </div>

                    {/* Required toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedQuestion.required}
                        onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { required: e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <label htmlFor="required" className="form-label" style={{ margin: 0 }}>
                        Required question
                      </label>
                    </div>

                    {/* Multiple Choice Options */}
                    {selectedQuestion.type === 'multiple_choice' && (
                      <div>
                        <label className="form-label">Answer Options</label>
                        <div className="grid gap-sm">
                          {selectedQuestion.options?.map((option, index) => (
                            <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const updatedOptions = selectedQuestion.options!.map(opt => 
                                    opt.id === option.id ? { ...opt, text: e.target.value, value: e.target.value } : opt
                                  );
                                  handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                                }}
                                placeholder={`Option ${index + 1}`}
                                style={{ flex: 1 }}
                              />
                              <button
                                onClick={() => {
                                  const updatedOptions = selectedQuestion.options!.filter(opt => opt.id !== option.id);
                                  handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                                }}
                                disabled={selectedQuestion.options!.length <= 2}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--error)',
                                  cursor: selectedQuestion.options!.length <= 2 ? 'not-allowed' : 'pointer',
                                  opacity: selectedQuestion.options!.length <= 2 ? 0.3 : 1,
                                  padding: '8px'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newOption: AnswerOption = {
                                id: `option_${Date.now()}`,
                                text: '',
                                value: ''
                              };
                              const updatedOptions = [...(selectedQuestion.options || []), newOption];
                              handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                            }}
                            style={{ justifyContent: 'flex-start', width: 'fit-content' }}
                          >
                            + Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Scale Question Settings */}
                    {selectedQuestion.type === 'scale' && (
                      <div className="grid grid-cols-2 gap-md">
                        <div>
                          <label className="form-label">Min Value</label>
                          <Input
                            type="number"
                            value={selectedQuestion.minValue ?? 1}
                            onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { minValue: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <label className="form-label">Max Value</label>
                          <Input
                            type="number"
                            value={selectedQuestion.maxValue ?? 10}
                            onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { maxValue: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Placeholder for text inputs */}
                    {(selectedQuestion.type === 'text' || selectedQuestion.type === 'email' || selectedQuestion.type === 'number') && (
                      <div>
                        <label className="form-label">Placeholder Text</label>
                        <Input
                          type="text"
                          value={selectedQuestion.placeholder ?? ''}
                          onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { placeholder: e.target.value })}
                          placeholder="Placeholder text..."
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Kit Sync Tab */}
                {activeTab === 'kit-sync' && (
                  <div className="grid gap-lg">
                    {connectionStatus !== 'connected' ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div className="h4 text-gray-500" style={{ marginBottom: '12px' }}>🔗</div>
                        <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>Connect to ConvertKit</div>
                        <div className="text-sm text-gray-500" style={{ marginBottom: '20px' }}>
                          Set up your ConvertKit connection to map survey responses to custom fields
                        </div>
                        <Link to="/admin/convertkit">
                          <Button variant="primary">Setup ConvertKit Connection</Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="form-label">ConvertKit Custom Field to Sync With</label>
                          <select
                            value={selectedQuestion.convertKitField || ''}
                            onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { convertKitField: e.target.value || undefined })}
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
                          {selectedQuestion.convertKitField && (
                            <p className="text-xs text-gray-600" style={{ marginTop: '4px' }}>
                              Answers will update the "{customFields.find(f => f.key === selectedQuestion.convertKitField)?.label}" field
                            </p>
                          )}
                        </div>

                        {/* Multiple Choice Mappings */}
                        {selectedQuestion.type === 'multiple_choice' && selectedQuestion.convertKitField && (
                          <div>
                            <h4 className="h4" style={{ marginBottom: '12px' }}>Answer Mappings</h4>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '16px',
                              marginBottom: '16px'
                            }}>
                              <div className="text-sm font-medium text-gray-700">Survey Answer</div>
                              <div className="text-sm font-medium text-gray-700">ConvertKit Field Value</div>
                            </div>
                            <div className="grid gap-sm">
                              {selectedQuestion.options?.map((option: AnswerOption) => (
                                <div key={option.id} style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '1fr 1fr', 
                                  gap: '16px',
                                  alignItems: 'center',
                                  padding: '12px',
                                  backgroundColor: 'var(--gray-50)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--gray-200)'
                                }}>
                                  <div className="text-sm font-medium">{option.text || 'Untitled Option'}</div>
                                  <Input
                                    value={option.convertKitFieldValue || ''}
                                    onChange={(e) => {
                                      const updatedOptions = selectedQuestion.options!.map(opt => 
                                        opt.id === option.id ? { ...opt, convertKitFieldValue: e.target.value || undefined } : opt
                                      );
                                      handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                                    }}
                                    placeholder="Field value..."
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-600" style={{ marginTop: '12px' }}>
                              When users select an answer, the corresponding field value will be stored in ConvertKit
                            </p>
                          </div>
                        )}

                        {/* Non-Multiple Choice Preview */}
                        {selectedQuestion.type !== 'multiple_choice' && selectedQuestion.convertKitField && (
                          <div style={{ 
                            padding: '16px',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--gray-200)'
                          }}>
                            <h4 className="h4" style={{ marginBottom: '8px' }}>Field Value Preview</h4>
                            <p className="text-sm text-gray-700">
                              <strong>Input:</strong> User's {selectedQuestion.type} response
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Stored:</strong> {
                                selectedQuestion.type === 'boolean' ? 'true/false' :
                                selectedQuestion.type === 'scale' ? `Number (${selectedQuestion.minValue || 1}-${selectedQuestion.maxValue || 10})` :
                                'Text value'
                              }
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Conditional Logic Tab */}
                {activeTab === 'logic' && (
                  <div className="grid gap-lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 className="h4" style={{ marginBottom: '8px' }}>Conditional Logic</h4>
                        <p className="text-sm text-gray-600">
                          Show different questions based on the answer to this question
                        </p>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleAddLogicRule}
                      >
                        + Add Logic Rule
                      </Button>
                    </div>
                    
                    {selectedQuestion.conditionalLogic && selectedQuestion.conditionalLogic.length > 0 ? (
                      <div className="grid gap-md">
                        {selectedQuestion.conditionalLogic.map((logic, index) => (
                          <div key={index} style={{ 
                            padding: '16px', 
                            border: '1px solid var(--gray-200)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--gray-50)'
                          }}>
                            <div className="grid gap-md">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="text-sm font-medium">If answer</span>
                                
                                <select
                                  value={logic.condition}
                                  onChange={(e) => handleUpdateLogicRule(index, { condition: e.target.value as ConditionalLogic['condition'] })}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                >
                                  <option value="equals">equals</option>
                                  <option value="not_equals">does not equal</option>
                                  <option value="contains">contains</option>
                                  <option value="greater_than">is greater than</option>
                                  <option value="less_than">is less than</option>
                                </select>

                                {selectedQuestion.type === 'multiple_choice' ? (
                                  <select
                                    value={logic.value}
                                    onChange={(e) => handleUpdateLogicRule(index, { value: e.target.value })}
                                    style={{
                                      padding: '4px 8px',
                                      border: '1px solid var(--gray-300)',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      minWidth: '120px'
                                    }}
                                  >
                                    <option value="">Select option...</option>
                                    {selectedQuestion.options?.map(option => (
                                      <option key={option.id} value={option.value}>
                                        {option.text}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <Input
                                    value={logic.value}
                                    onChange={(e) => handleUpdateLogicRule(index, { value: e.target.value })}
                                    placeholder="Enter value..."
                                    size="sm"
                                    style={{ width: '120px' }}
                                  />
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="text-sm font-medium">Then go to</span>
                                
                                <select
                                  value={logic.nextQuestionId || ''}
                                  onChange={(e) => handleUpdateLogicRule(index, { nextQuestionId: e.target.value || null })}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    minWidth: '200px'
                                  }}
                                >
                                  <option value="">End survey</option>
                                  {survey.questions
                                    .filter(q => q.id !== selectedQuestion.id)
                                    .sort((a, b) => a.order - b.order)
                                    .map((question, qIndex) => (
                                      <option key={question.id} value={question.id}>
                                        Q{qIndex + 1}: {question.title}
                                      </option>
                                    ))}
                                </select>

                                <button
                                  onClick={() => handleDeleteLogicRule(index)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--error)',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontSize: '14px'
                                  }}
                                >
                                  ✕ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        border: '1px dashed var(--gray-300)',
                        borderRadius: '8px',
                        color: 'var(--gray-600)'
                      }}>
                        <div className="h4 text-gray-500" style={{ marginBottom: '12px' }}>🔀</div>
                        <div className="text-lg text-gray-600" style={{ marginBottom: '8px' }}>No logic rules set up yet</div>
                        <div className="text-sm text-gray-500">
                          Add conditional logic to create dynamic survey paths
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </GlassCard>
            ) : (
              <GlassCard>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 className="h3" style={{ marginBottom: '16px' }}>No Question Selected</h3>
                  <p className="text-gray-600">
                    Select a question from the list or create a new one to start editing
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={handleAddQuestion}
                    style={{ marginTop: '20px' }}
                  >
                    Create First Question
                  </Button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Survey Settings */}
        <div style={{ marginTop: '40px' }}>
          <GlassCard dark>
            <h3 className="h3" style={{ marginBottom: '20px' }}>Survey Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="showProgress"
                  checked={survey.settings.showProgressBar}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, showProgressBar: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="showProgress">
                  <div className="font-medium">Show progress bar</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Display completion progress</div>
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="requireEmail"
                  checked={survey.settings.requireEmailCapture}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, requireEmailCapture: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="requireEmail">
                  <div className="font-medium">Require email</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Capture email before survey</div>
                </label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="allowBackNavigation"
                  checked={survey.settings.allowBackNavigation ?? true}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, allowBackNavigation: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="allowBackNavigation">
                  <div className="font-medium">Show back button</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Allow users to go back to previous questions</div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <div>
                <label className="form-label">Success Message</label>
                <Input
                  type="text"
                  value={survey.settings.successMessage ?? ''}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, successMessage: e.target.value }
                  })}
                  placeholder="Thank you for completing our survey!"
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'rgba(255,255,255,0.8)' }}>
                  Custom message shown after survey completion
                </p>
              </div>
              
              <div>
                <label className="form-label">Redirect URL (optional)</label>
                <Input
                  type="url"
                  value={survey.settings.redirectUrl ?? ''}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, redirectUrl: e.target.value }
                  })}
                  placeholder="https://example.com/thank-you"
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'rgba(255,255,255,0.8)' }}>
                  Automatically redirect users after 5 seconds
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Add padding at bottom */}
        <div style={{ height: '40px' }}></div>
      </main>

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Delete Question</h3>
            <p style={{ marginBottom: '24px', color: 'var(--gray-600)' }}>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex gap-md" style={{ justifyContent: 'center' }}>
              <Button variant="secondary" onClick={cancelDeleteQuestion}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDeleteQuestion} style={{ backgroundColor: 'var(--error)' }}>
                Delete Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyEditorPage;