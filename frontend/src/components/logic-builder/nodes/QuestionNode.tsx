import { Handle, Position } from 'reactflow';
import type { Question } from '../../../types';

interface QuestionNodeProps {
  data: {
    question: Question;
    label?: string;
  };
  selected?: boolean;
}

const QuestionNode = ({ data, selected }: QuestionNodeProps) => {
  const { question } = data;
  
  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '🗳️';
      case 'text': return '📝';
      case 'email': return '✉️';
      case 'number': return '🔢';
      case 'boolean': return '✓/✗';
      case 'scale': return '📊';
      default: return '❓';
    }
  };

  return (
    <div 
      style={{
        background: selected ? 'var(--primary)' : 'white',
        color: selected ? 'white' : 'var(--gray-800)',
        padding: '12px 16px',
        borderRadius: '12px',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--gray-200)'}`,
        minWidth: '200px',
        maxWidth: '280px',
        boxShadow: selected 
          ? '0 8px 24px rgba(99, 102, 241, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'grab'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: 'var(--primary)',
          width: '10px',
          height: '10px',
          border: '2px solid white'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{getQuestionIcon(question.type)}</span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          textTransform: 'uppercase',
          opacity: 0.7
        }}>
          {question.type.replace('_', ' ')}
        </span>
      </div>
      
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '500',
        lineHeight: '1.4',
        wordBreak: 'break-word'
      }}>
        {question.title}
      </div>
      
      {question.options && question.options.length > 0 && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '12px', 
          opacity: 0.7 
        }}>
          {question.options.length} options
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: 'var(--primary)',
          width: '10px',
          height: '10px',
          border: '2px solid white'
        }}
      />
    </div>
  );
};

export default QuestionNode;