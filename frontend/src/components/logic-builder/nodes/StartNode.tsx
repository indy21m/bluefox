import { Handle, Position } from 'reactflow';

interface StartNodeProps {
  data: {
    label?: string;
  };
  selected?: boolean;
}

const StartNode = ({ data, selected }: StartNodeProps) => {
  const { label = 'Start' } = data;
  
  return (
    <div 
      style={{
        background: selected ? 'var(--primary)' : 'white',
        color: selected ? 'white' : 'var(--primary)',
        padding: '12px 24px',
        borderRadius: '24px',
        border: `2px solid var(--primary)`,
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: selected 
          ? '0 8px 24px rgba(99, 102, 241, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'grab'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🚀</span>
        <span>{label}</span>
      </div>
      
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

export default StartNode;