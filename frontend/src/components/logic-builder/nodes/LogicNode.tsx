import { Handle, Position } from 'reactflow';
import type { LogicRule } from '../../../types';

interface LogicNodeProps {
  data: {
    logic?: LogicRule;
    label?: string;
  };
  selected?: boolean;
}

const LogicNode = ({ data, selected }: LogicNodeProps) => {
  const { logic, label } = data;
  
  return (
    <div 
      style={{
        background: selected ? 'var(--warning)' : '#FFF9E6',
        border: `2px solid ${selected ? 'var(--warning)' : '#F59E0B'}`,
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected 
          ? '0 8px 24px rgba(245, 158, 11, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'grab',
        transform: 'rotate(45deg)'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: '#F59E0B',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          top: '-5px',
          transform: 'rotate(-45deg)'
        }}
      />
      
      <div style={{ 
        transform: 'rotate(-45deg)',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: '600',
        color: '#92400E'
      }}>
        {label || 'IF'}
        {logic && (
          <div style={{ fontSize: '10px', marginTop: '2px' }}>
            {logic.operator}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        id="true" 
        style={{ 
          background: '#10B981',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          right: '-5px',
          transform: 'rotate(-45deg)'
        }}
      />
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="false" 
        style={{ 
          background: '#EF4444',
          width: '10px',
          height: '10px',
          border: '2px solid white',
          bottom: '-5px',
          transform: 'rotate(-45deg)'
        }}
      />
    </div>
  );
};

export default LogicNode;