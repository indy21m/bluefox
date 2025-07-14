import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header, GlassCard, Input } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToastCompat';
import { useConvertKit } from '../contexts/ConvertKitContext';
import LogicBuilder from '../components/logic-builder/LogicBuilder';
import ThemeEditor from '../components/theme-builder/ThemeEditor';
import type { Survey, Question, AnswerOption, ConditionalLogic, FlowNode, FlowEdge, SurveyTheme } from '../types';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'kit-sync' | 'logic' | 'flow'>('overview');
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [draggedOption, setDraggedOption] = useState<string | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  useEffect(() => {
    if (surveyId) {
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
          // If parsing fails and it's demo, use demo survey
          if (surveyId === 'demo') {
            setSurvey(demoSurvey);
            if (demoSurvey.questions.length > 0) {
              setSelectedQuestion(demoSurvey.questions[0]);
            }
          } else {
            showToast('Failed to load survey', 'error');
            navigate('/surveys');
          }
        }
      } else {
        // No saved survey
        if (surveyId === 'demo') {
          // Use demo survey
          setSurvey(demoSurvey);
          if (demoSurvey.questions.length > 0) {
            setSelectedQuestion(demoSurvey.questions[0]);
          }
        } else {
          showToast('Survey not found', 'error');
          navigate('/surveys');
        }
      }
    }
  }, [surveyId, navigate, showToast]);

  useEffect(() => {
    // Add class to body for CSS targeting
    document.body.classList.add('survey-editor-page');
    
    return () => {
      document.body.classList.remove('survey-editor-page');
    };
  }, []);

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
      id: `logic_${Date.now()}`,
      questionId: selectedQuestion.id,
      condition: 'equals',
      value: '',
      nextQuestionId: null
    };
    
    const updatedLogic = [...(selectedQuestion.conditionalLogic || []), newLogic];
    handleQuestionUpdate(selectedQuestion.id, { conditionalLogic: updatedLogic });
    
    // Also update the flow data if it exists
    if (survey.flowData) {
      const { nodes, edges } = survey.flowData;
      // Remove any existing default edge from this question
      const filteredEdges = edges.filter(e => 
        !(e.source === selectedQuestion.id && (!e.data?.conditions || e.data.conditions.length === 0))
      );
      setSurvey({
        ...survey,
        flowData: { nodes, edges: filteredEdges }
      });
    }
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

  const handleQuestionDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleQuestionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleQuestionDrop = (targetQuestionId: string) => {
    if (!draggedQuestion || draggedQuestion === targetQuestionId) {
      setDraggedQuestion(null);
      return;
    }

    const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);
    const draggedIndex = sortedQuestions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = sortedQuestions.findIndex(q => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedQuestion(null);
      return;
    }

    // Remove dragged question and insert at target position
    const reorderedQuestions = [...sortedQuestions];
    const [draggedQuestionObj] = reorderedQuestions.splice(draggedIndex, 1);
    reorderedQuestions.splice(targetIndex, 0, draggedQuestionObj);

    // Update order numbers
    reorderedQuestions.forEach((q, index) => {
      q.order = index + 1;
    });

    setSurvey({ ...survey, questions: reorderedQuestions });
    setDraggedQuestion(null);
    showToast('Question order updated', 'success');
  };

  const handleOptionDragStart = (optionId: string) => {
    setDraggedOption(optionId);
  };

  const handleOptionDrop = (targetOptionId: string) => {
    if (!draggedOption || !selectedQuestion || draggedOption === targetOptionId) {
      setDraggedOption(null);
      return;
    }

    const options = selectedQuestion.options || [];
    const draggedIndex = options.findIndex(opt => opt.id === draggedOption);
    const targetIndex = options.findIndex(opt => opt.id === targetOptionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedOption(null);
      return;
    }

    // Reorder options
    const reorderedOptions = [...options];
    const [draggedOptionObj] = reorderedOptions.splice(draggedIndex, 1);
    reorderedOptions.splice(targetIndex, 0, draggedOptionObj);

    handleQuestionUpdate(selectedQuestion.id, { options: reorderedOptions });
    setDraggedOption(null);
    showToast('Answer option order updated', 'success');
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

  const handleSaveFlowData = (nodes: FlowNode[], edges: FlowEdge[]) => {
    // Update the survey with new flow data
    const updatedSurvey = {
      ...survey,
      flowData: { nodes, edges }
    };
    
    // Sync visual flow to conditional logic for backward compatibility
    const updatedQuestions = survey.questions.map(question => {
      // Find edges from this question
      const questionEdges = edges.filter(edge => edge.source === question.id);
      
      // Convert edges to conditional logic
      const newConditionalLogic: ConditionalLogic[] = [];
      
      questionEdges.forEach(edge => {
        if (edge.data?.conditions && edge.data.conditions.length > 0) {
          // For edges with conditions
          edge.data.conditions.forEach(condition => {
            newConditionalLogic.push({
              id: `logic_${edge.id}_${condition.id}`,
              questionId: question.id,
              condition: condition.operator as any,
              value: condition.value || '',
              nextQuestionId: edge.target === 'end' ? null : edge.target
            });
          });
        } else if (edge.target !== 'end') {
          // For edges without conditions (direct connections)
          newConditionalLogic.push({
            id: `logic_${edge.id}_default`,
            questionId: question.id,
            condition: 'equals',
            value: '*', // Special value to indicate "always"
            nextQuestionId: edge.target
          });
        }
      });
      
      return {
        ...question,
        conditionalLogic: newConditionalLogic.length > 0 ? newConditionalLogic : question.conditionalLogic
      };
    });
    
    setSurvey({
      ...updatedSurvey,
      questions: updatedQuestions
    });
    
    showToast('Logic flow saved!', 'success');
  };

  const handleSaveTheme = (theme: SurveyTheme) => {
    // Save theme and associate with survey
    setSurvey({
      ...survey,
      themeId: theme.id
    });
    setShowThemeEditor(false);
    showToast('Theme saved successfully!', 'success');
    handleSaveSurvey();
  };

  return (
    <div className="min-h-screen w-full">
      <Header 
        rightContent={
          <div className="flex items-center gap-md">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        }
      />
      
      <main className="container" style={{ paddingTop: '20px', width: '100%' }}>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg" style={{ width: '100%' }}>
          {/* Question List */}
          <div>
            <GlassCard>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                width: '100%'
              }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Input
                    type="text"
                    value={survey.title}
                    onChange={(e) => {
                      handleSurveyTitleChange(e.target.value);
                      // Show temporary save indicator
                      const saveIndicator = document.getElementById('title-save-indicator');
                      if (saveIndicator) {
                        saveIndicator.style.opacity = '1';
                        setTimeout(() => {
                          saveIndicator.style.opacity = '0';
                        }, 2000);
                      }
                    }}
                    style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      border: '1px solid transparent', 
                      background: 'transparent', 
                      padding: '4px 12px',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onBlur={handleSaveSurvey}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target instanceof HTMLElement) {
                        e.target.blur();
                      }
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid var(--primary-blue)';
                      e.target.style.background = 'white';
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        e.target.style.border = '1px solid transparent';
                        e.target.style.background = 'transparent';
                      }
                    }}
                    placeholder="Survey Title..."
                  />
                  <div 
                    id="title-save-indicator"
                    style={{ 
                      position: 'absolute',
                      bottom: '-20px',
                      left: '12px',
                      backgroundColor: 'var(--success)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      opacity: '0',
                      transition: 'opacity 0.3s',
                      pointerEvents: 'none'
                    }}
                  >
                    ✓ Saved
                  </div>
                  
                  {/* Survey Description */}
                  <div style={{ marginTop: '8px' }}>
                    <Input
                      type="text"
                      value={survey.description || ''}
                      onChange={(e) => {
                        setSurvey({ ...survey, description: e.target.value });
                      }}
                      style={{ 
                        fontSize: '14px', 
                        border: '1px solid transparent', 
                        background: 'transparent', 
                        padding: '2px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        width: '100%'
                      }}
                      onBlur={handleSaveSurvey}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target instanceof HTMLElement) {
                          e.target.blur();
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid var(--primary-blue)';
                        e.target.style.background = 'white';
                      }}
                      onMouseLeave={(e) => {
                        if (document.activeElement !== e.target) {
                          e.target.style.border = '1px solid transparent';
                          e.target.style.background = 'transparent';
                        }
                      }}
                      placeholder="Add a description for your survey..."
                    />
                  </div>
                </div>
                <div className="flex gap-sm" style={{ flexShrink: 0 }}>
                  <Link to="/surveys">
                    <button className="btn btn-secondary">
                      <span>← Back</span>
                    </button>
                  </Link>
                  <Link to={`/survey/${survey.slug || surveyId}`} target="_blank">
                    <button className="btn btn-secondary">
                      <span>🔍 Test</span>
                    </button>
                  </Link>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowThemeEditor(true)}
                  >
                    <span>🎨 Theme</span>
                  </button>
                  <button 
                    className={`btn btn-secondary ${isSaving ? 'loading' : ''}`}
                    onClick={handleSaveSurvey}
                    disabled={isSaving}
                  >
                    {isSaving && <div className="loading-spinner"></div>}
                    <span>{isSaving ? '...' : '💾'}</span>
                  </button>
                  <button className="btn btn-primary" onClick={handleAddQuestion}>
                    <span>+ Add</span>
                  </button>
                </div>
              </div>
              
              <div className="grid gap-sm">
                {survey.questions
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={() => handleQuestionDragStart(question.id)}
                    onDragOver={handleQuestionDragOver}
                    onDrop={() => handleQuestionDrop(question.id)}
                    onClick={() => setSelectedQuestion(question)}
                    style={{
                      padding: '12px',
                      border: `2px solid ${selectedQuestion?.id === question.id ? 'var(--primary-blue)' : 'var(--gray-200)'}`,
                      borderRadius: '8px',
                      cursor: draggedQuestion ? 'grabbing' : 'grab',
                      background: draggedQuestion === question.id ? 'var(--primary-light)' : 
                                selectedQuestion?.id === question.id ? 'var(--gray-50)' : 'transparent',
                      transition: 'all 0.2s',
                      opacity: draggedQuestion === question.id ? 0.5 : 1
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
                            padding: '4px',
                            color: 'var(--gray-600)',
                            fontSize: '16px',
                            fontWeight: 'bold'
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
                            padding: '4px',
                            color: 'var(--gray-600)',
                            fontSize: '16px',
                            fontWeight: 'bold'
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

                {/* Tab Navigation and Delete Button */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  gap: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '4px',
                    backgroundColor: 'var(--gray-100)',
                    padding: '4px',
                    borderRadius: '8px',
                    flex: 1
                  }}>
                  {[
                    { id: 'overview', label: '📝 Overview' },
                    { id: 'kit-sync', label: '🔗 Sync with Kit' },
                    { id: 'logic', label: '🔀 Conditional Logic' },
                    { id: 'flow', label: '🎯 Logic Flow' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'overview' | 'kit-sync' | 'logic' | 'flow')}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: activeTab === tab.id ? 'white' : 'transparent',
                        boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        borderRadius: '6px',
                        color: activeTab === tab.id ? 'var(--gray-800)' : 'var(--gray-600)',
                        fontWeight: activeTab === tab.id ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        flex: 1
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
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                    style={{ 
                      color: 'var(--error)', 
                      border: '1px solid var(--error)',
                      backgroundColor: 'transparent',
                      flexShrink: 0
                    }}
                  >
                    <span>🗑️ Delete Question</span>
                  </button>
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[
                          { value: 'multiple_choice', label: 'Multiple Choice', icon: '🗳️' },
                          { value: 'text', label: 'Text Input', icon: '📝' },
                          { value: 'email', label: 'Email', icon: '📧' },
                          { value: 'number', label: 'Number', icon: '🔢' },
                          { value: 'boolean', label: 'Yes/No', icon: '✅' },
                          { value: 'scale', label: 'Scale', icon: '📏' }
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => handleQuestionUpdate(selectedQuestion.id, { type: type.value as Question['type'] })}
                            style={{
                              padding: '8px 16px',
                              border: selectedQuestion.type === type.value ? '2px solid var(--primary-blue)' : '1px solid var(--gray-200)',
                              borderRadius: '6px',
                              background: selectedQuestion.type === type.value ? 'var(--primary-light)' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '14px',
                              fontWeight: selectedQuestion.type === type.value ? '600' : '400',
                              color: selectedQuestion.type === type.value ? 'var(--primary-blue)' : 'var(--gray-700)'
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>{type.icon}</span>
                            <span>{type.label}</span>
                          </button>
                        ))}
                      </div>
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
                        <div 
                          style={{ 
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: '12px',
                            padding: '16px',
                            border: '1px solid var(--gray-200)',
                            width: '100%'
                          }}
                        >
                        <div 
                          className="grid gap-sm" 
                          style={{ 
                            maxHeight: '320px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            width: '100%'
                          }}
                        >
                          {selectedQuestion.options?.map((option, index) => (
                            <div 
                              key={option.id} 
                              draggable
                              onDragStart={() => handleOptionDragStart(option.id)}
                              onDragOver={handleQuestionDragOver}
                              onDrop={() => handleOptionDrop(option.id)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px',
                                padding: '12px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid var(--gray-200)',
                                cursor: draggedOption ? 'grabbing' : 'grab',
                                opacity: draggedOption === option.id ? 0.5 : 1,
                                transition: 'all 0.2s',
                                width: '100%'
                              }}
                            >
                              <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: 'var(--gray-400)',
                                flexShrink: 0,
                                cursor: 'grab'
                              }}>
                                ⋮⋮
                              </div>
                              <input
                                type="text"
                                className="form-input"
                                value={option.text}
                                onChange={(e) => {
                                  const updatedOptions = selectedQuestion.options!.map(opt => 
                                    opt.id === option.id ? { ...opt, text: e.target.value, value: e.target.value } : opt
                                  );
                                  handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                                }}
                                placeholder={`Option ${index + 1}`}
                                style={{ 
                                  flex: 1,
                                  fontSize: '14px',
                                  padding: '8px 12px',
                                  backgroundColor: 'white',
                                  border: '1px solid var(--gray-300)',
                                  borderRadius: '6px',
                                  transition: 'all 0.2s',
                                  minWidth: 0,
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = 'var(--primary-blue)';
                                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'var(--gray-300)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updatedOptions = selectedQuestion.options!.filter(opt => opt.id !== option.id);
                                  handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                                }}
                                disabled={selectedQuestion.options!.length <= 2}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  borderRadius: '4px',
                                  color: 'var(--error)',
                                  cursor: selectedQuestion.options!.length <= 2 ? 'not-allowed' : 'pointer',
                                  opacity: selectedQuestion.options!.length <= 2 ? 0.3 : 1,
                                  padding: '4px',
                                  fontSize: '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  flexShrink: 0,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedQuestion.options!.length > 2) {
                                    e.currentTarget.style.backgroundColor = 'var(--error-light)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          </div>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              const newOption: AnswerOption = {
                                id: `option_${Date.now()}`,
                                text: '',
                                value: ''
                              };
                              const updatedOptions = [...(selectedQuestion.options || []), newOption];
                              handleQuestionUpdate(selectedQuestion.id, { options: updatedOptions });
                            }}
                            style={{ 
                              justifyContent: 'flex-start', 
                              width: 'fit-content',
                              marginTop: '12px'
                            }}
                          >
                            <span>+ Add Option</span>
                          </button>
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
                        <Link to="/integrations/convertkit">
                          <button className="btn btn-primary">
                            <span>Setup ConvertKit Connection</span>
                          </button>
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
                      <button 
                        className="btn btn-secondary"
                        onClick={handleAddLogicRule}
                      >
                        <span>+ Add Logic Rule</span>
                      </button>
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
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const convertedValue = (selectedQuestion.type === 'number' || selectedQuestion.type === 'scale') 
                                        ? (val === '' ? '' : Number(val))
                                        : val;
                                      handleUpdateLogicRule(index, { value: convertedValue });
                                    }}
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
                                    .map((question) => {
                                      // Find the actual index in the full question list
                                      const actualIndex = survey.questions
                                        .sort((a, b) => a.order - b.order)
                                        .findIndex(q => q.id === question.id);
                                      return (
                                        <option key={question.id} value={question.id}>
                                          Q{actualIndex + 1}: {question.title}
                                        </option>
                                      );
                                    })}
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

                {/* Logic Flow Tab */}
                {activeTab === 'flow' && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h4 className="h4" style={{ marginBottom: '8px' }}>Visual Logic Flow</h4>
                      <p className="text-sm text-gray-600">
                        Design your survey flow visually. Drag to connect questions and add conditional logic.
                      </p>
                    </div>
                    <div className="logic-builder-wrapper" style={{ width: '100%', height: '600px', position: 'relative', overflow: 'visible', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <LogicBuilder 
                        survey={survey} 
                        onSave={handleSaveFlowData}
                      />
                    </div>
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
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddQuestion}
                    style={{ marginTop: '20px' }}
                  >
                    <span>Create First Question</span>
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Survey Settings */}
        <div style={{ marginTop: '40px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3xl)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--glass-border)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: 'var(--gray-800)' }}>Survey Settings</h3>
            
            <div style={{ marginBottom: '24px' }}>
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
                  <div className="font-medium" style={{ color: 'var(--gray-800)' }}>Require email</div>
                  <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Capture email before survey</div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ marginBottom: '24px' }}>
              <div>
                <label className="form-label">Survey URL Slug</label>
                <Input
                  type="text"
                  value={survey.slug ?? ''}
                  onChange={(e) => {
                    // Only allow lowercase letters, numbers, and hyphens
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setSurvey({ ...survey, slug });
                  }}
                  placeholder="my-survey-name"
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--gray-600)' }}>
                  Custom URL: /survey/{survey.slug || 'my-survey-name'}
                </p>
              </div>
              
              <div>
                <label className="form-label">Survey ID</label>
                <Input
                  type="text"
                  value={survey.id}
                  disabled
                  style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--gray-600)' }}>
                  Alternative URL: /survey/{survey.id}
                </p>
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
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--gray-600)' }}>
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
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--gray-600)' }}>
                  Automatically redirect users after 5 seconds
                </p>
              </div>
            </div>
          </div>
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
              <button className="btn btn-secondary" onClick={cancelDeleteQuestion}>
                <span>Cancel</span>
              </button>
              <button className="btn btn-primary" onClick={confirmDeleteQuestion} style={{ backgroundColor: 'var(--error)' }}>
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Editor Modal */}
      {showThemeEditor && surveyId && (
        <ThemeEditor
          surveyId={surveyId}
          onSave={handleSaveTheme}
          onClose={() => setShowThemeEditor(false)}
        />
      )}
    </div>
  );
};

export default SurveyEditorPage;