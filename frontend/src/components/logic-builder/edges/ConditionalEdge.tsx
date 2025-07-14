import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { Condition } from '../../../types';

interface ConditionalEdgeData {
  conditions?: Condition[];
  operator?: 'AND' | 'OR';
}

const ConditionalEdge: React.FC<EdgeProps<ConditionalEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const hasConditions = data?.conditions && data.conditions.length > 0;
  const conditionCount = data?.conditions?.length || 0;

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: hasConditions ? '#f59e0b' : '#6366f1',
          strokeWidth: selected ? 3 : 2,
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
          }}
          className="nodrag nopan"
        >
          {hasConditions && (
            <div
              style={{
                background: 'white',
                border: '2px solid #f59e0b',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#f59e0b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔀</span>
              <span>{conditionCount} {conditionCount === 1 ? 'condition' : 'conditions'}</span>
              {data.operator && conditionCount > 1 && (
                <span style={{ fontSize: '10px', opacity: 0.8 }}>({data.operator})</span>
              )}
            </div>
          )}
          {!hasConditions && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                color: '#6b7280',
                opacity: selected ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              Click to add condition
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ConditionalEdge;