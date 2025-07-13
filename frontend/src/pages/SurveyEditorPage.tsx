import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header, Button, GlassCard, Input } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Survey, Question, AnswerOption, ConditionalLogic } from '../types';
import { demoSurvey } from '../data/demoSurvey';

const SurveyEditorPage = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [survey, setSurvey] = useState<Survey>(demoSurvey);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In a real app, load survey from API
    if (surveyId === 'demo') {
      setSurvey(demoSurvey);
      if (demoSurvey.questions.length > 0) {
        setSelectedQuestion(demoSurvey.questions[0]);
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
      surveyId: survey.id,
      type: 'multiple_choice',
      title: 'New Question',
      description: '',
      order: survey.questions.length,
      required: true,
      options: [
        { id: `option_${Date.now()}_1`, text: 'Option 1', value: 'option1' },
        { id: `option_${Date.now()}_2`, text: 'Option 2', value: 'option2' }
      ]
    };

    const updatedSurvey = {
      ...survey,
      questions: [...survey.questions, newQuestion]
    };
    
    setSurvey(updatedSurvey);
    setSelectedQuestion(newQuestion);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = survey.questions.filter(q => q.id !== questionId);
      setSurvey({ ...survey, questions: updatedQuestions });
      
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(updatedQuestions[0] || null);
      }
    }
  };

  const handleReorderQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = survey.questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= survey.questions.length) return;

    const newQuestions = [...survey.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    
    // Update order numbers
    newQuestions.forEach((q, index) => {
      q.order = index;
    });

    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleAddOption = (questionId: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const newOption: AnswerOption = {
      id: `option_${Date.now()}`,
      text: `Option ${question.options.length + 1}`,
      value: `option${question.options.length + 1}`
    };

    handleQuestionUpdate(questionId, {
      options: [...question.options, newOption]
    });
  };

  const handleUpdateOption = (questionId: string, optionId: string, text: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    handleQuestionUpdate(questionId, {
      options: question.options.map(opt => 
        opt.id === optionId ? { ...opt, text, value: text.toLowerCase().replace(/\s+/g, '_') } : opt
      )
    });
  };

  const handleDeleteOption = (questionId: string, optionId: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question || !question.options || question.options.length <= 2) return;

    handleQuestionUpdate(questionId, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, save to API
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
              <h1 className="h1">Survey Editor</h1>
              <Input
                type="text"
                value={survey.title}
                onChange={(e) => handleSurveyTitleChange(e.target.value)}
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  background: 'transparent',
                  border: '2px solid transparent',
                  padding: '4px 8px',
                  marginTop: '8px'
                }}
                placeholder="Survey Title"
              />
            </div>
            <div className="flex gap-md">
              <Link to="/admin/surveys">
                <Button variant="secondary">← Back</Button>
              </Link>
              <Link to={`/survey/${surveyId}`} target="_blank">
                <Button variant="secondary">Preview</Button>
              </Link>
              <Button 
                variant="success" 
                onClick={handleSave}
                loading={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg" style={{ width: '100%' }}>
          {/* Questions List */}
          <div style={{ gridColumn: 'span 1' }}>
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="h3">Questions</h3>
                <Button variant="primary" size="sm" onClick={handleAddQuestion}>
                  + Add
                </Button>
              </div>
              
              <div className="grid gap-sm">
                {survey.questions.map((question, index) => (
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
                        <div className="text-xs text-gray-600">{question.type}</div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="h3">Edit Question</h3>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                    style={{ color: 'var(--error)' }}
                  >
                    Delete Question
                  </Button>
                </div>

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
                      className="form-select"
                      value={selectedQuestion.type}
                      onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { type: e.target.value as Question['type'] })}
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="text">Text Input</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="boolean">Yes/No</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>

                  {/* Required Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedQuestion.required}
                      onChange={(e) => handleQuestionUpdate(selectedQuestion.id, { required: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="required" className="font-medium">Required Question</label>
                  </div>

                  {/* Answer Options (for multiple choice) */}
                  {selectedQuestion.type === 'multiple_choice' && selectedQuestion.options && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Answer Options</label>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleAddOption(selectedQuestion.id)}
                        >
                          + Add Option
                        </Button>
                      </div>
                      
                      <div className="grid gap-sm">
                        {selectedQuestion.options.map((option, index) => (
                          <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="text-sm" style={{ minWidth: '30px' }}>{index + 1}.</span>
                            <Input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleUpdateOption(selectedQuestion.id, option.id, e.target.value)}
                              placeholder="Option text..."
                              style={{ flex: 1 }}
                            />
                            <button
                              onClick={() => handleDeleteOption(selectedQuestion.id, option.id)}
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
                      </div>
                    </div>
                  )}

                  {/* Scale Range (for scale questions) */}
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

                  {/* Placeholder (for text inputs) */}
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

                {/* Conditional Logic Section */}
                <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '2px solid var(--gray-200)' }}>
                  <h4 className="h4" style={{ marginBottom: '16px' }}>Conditional Logic</h4>
                  <p className="text-sm text-gray-600" style={{ marginBottom: '20px' }}>
                    Show different questions based on the answer to this question
                  </p>
                  
                  {selectedQuestion.conditionalLogic && selectedQuestion.conditionalLogic.length > 0 ? (
                    <div className="grid gap-md">
                      {selectedQuestion.conditionalLogic.map((logic, index) => (
                        <div key={index} style={{ 
                          padding: '12px', 
                          border: '1px solid var(--gray-200)', 
                          borderRadius: '8px' 
                        }}>
                          <div className="text-sm">
                            If answer {logic.condition} <strong>{logic.value}</strong>,
                            go to question <strong>{survey.questions.find(q => q.id === logic.nextQuestionId)?.title || 'Unknown'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', 
                      border: '2px dashed var(--gray-300)', 
                      borderRadius: '8px',
                      textAlign: 'center' 
                    }}>
                      <p className="text-sm text-gray-600">No conditional logic set</p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        style={{ marginTop: '12px' }}
                        onClick={() => showToast('Conditional logic builder coming soon!', 'info')}
                      >
                        Add Conditional Logic
                      </Button>
                    </div>
                  )}
                </div>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="autoAdvance"
                  checked={survey.settings.autoAdvance}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, autoAdvance: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="autoAdvance">
                  <div className="font-medium">Auto-advance</div>
                  <div className="text-sm opacity-80">Automatically move to next question</div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="showProgressBar"
                  checked={survey.settings.showProgressBar}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, showProgressBar: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="showProgressBar">
                  <div className="font-medium">Progress Bar</div>
                  <div className="text-sm opacity-80">Show completion progress</div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="allowBackNavigation"
                  checked={survey.settings.allowBackNavigation}
                  onChange={(e) => setSurvey({
                    ...survey,
                    settings: { ...survey.settings, allowBackNavigation: e.target.checked }
                  })}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="allowBackNavigation">
                  <div className="font-medium">Back Navigation</div>
                  <div className="text-sm opacity-80">Allow going back to previous questions</div>
                </label>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default SurveyEditorPage;