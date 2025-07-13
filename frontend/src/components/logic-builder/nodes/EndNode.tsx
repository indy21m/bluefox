import { Handle, Position } from 'reactflow';

interface EndNodeProps {
  data: {
    label?: string;
    color?: string;
  };
  selected?: boolean;
}

const EndNode = ({ data, selected }: EndNodeProps) => {
  const { label = 'End Survey', color = 'var(--success)' } = data;
  
  return (
    <div 
      style={{
        background: selected ? color : 'white',
        color: selected ? 'white' : color,
        padding: '12px 24px',
        borderRadius: '24px',
        border: `2px solid ${color}`,
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: selected 
          ? '0 8px 24px rgba(16, 185, 129, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'grab'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: color,
          width: '10px',
          height: '10px',
          border: '2px solid white'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🏁</span>
        <span>{label}</span>
      </div>
    </div>
  );
};

export default EndNode;