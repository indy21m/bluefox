import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import { motion } from 'framer-motion';

import { QuestionNode, LogicNode, EndNode, StartNode } from './nodes';
import ConditionEditor from './ConditionEditor';
import type { Survey, Question, FlowNode, FlowEdge, Condition } from '../../types';

const nodeTypes = {
  question: QuestionNode,
  logic: LogicNode,
  end: EndNode,
  start: StartNode,
};

interface LogicBuilderProps {
  survey: Survey;
  onSave: (nodes: FlowNode[], edges: FlowEdge[]) => void;
}

const LogicBuilder = ({ survey, onSave }: LogicBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [selectedSourceQuestion, setSelectedSourceQuestion] = useState<Question | null>(null);

  // Initialize nodes from survey questions
  useEffect(() => {
    if (survey.flowData?.nodes && survey.flowData?.edges) {
      // Load existing flow data
      setNodes(survey.flowData.nodes);
      setEdges(survey.flowData.edges);
    } else {
      // Create initial flow from questions
      const initialNodes: Node[] = [
        {
          id: 'start',
          type: 'start',
          position: { x: 400, y: 50 },
          data: { label: 'Start Survey' },
        },
      ];

      const initialEdges: Edge[] = [];

      // Add question nodes
      survey.questions.forEach((question, index) => {
        const node: Node = {
          id: question.id,
          type: 'question',
          position: { x: 250 + (index % 3) * 300, y: 200 + Math.floor(index / 3) * 200 },
          data: { question },
        };
        initialNodes.push(node);

        // Connect start to first question
        if (index === 0) {
          initialEdges.push({
            id: `start-${question.id}`,
            source: 'start',
            target: question.id,
            animated: true,
          });
        }

        // Connect questions in sequence
        if (index < survey.questions.length - 1) {
          initialEdges.push({
            id: `${question.id}-${survey.questions[index + 1].id}`,
            source: question.id,
            target: survey.questions[index + 1].id,
          });
        }
      });

      // Add end node
      const endNode: Node = {
        id: 'end',
        type: 'end',
        position: { x: 400, y: 200 + Math.floor(survey.questions.length / 3) * 200 + 200 },
        data: { label: 'Survey Complete' },
      };
      initialNodes.push(endNode);

      // Connect last question to end
      if (survey.questions.length > 0) {
        const lastQuestion = survey.questions[survey.questions.length - 1];
        initialEdges.push({
          id: `${lastQuestion.id}-end`,
          source: lastQuestion.id,
          target: 'end',
        });
      }

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [survey, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366F1',
        },
        style: {
          stroke: '#6366F1',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    
    // Find the source question
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode && sourceNode.type === 'question' && sourceNode.data.question) {
      setSelectedSourceQuestion(sourceNode.data.question);
      setShowConditionEditor(true);
    }
  }, [nodes]);

  const handleSave = () => {
    // Convert React Flow format to our FlowNode/FlowEdge format
    const flowNodes: FlowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      position: node.position,
      data: node.data,
    }));

    const flowEdges: FlowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
      label: typeof edge.label === 'string' ? edge.label : undefined,
      animated: edge.animated,
      style: edge.style,
      data: edge.data
    }));

    onSave(flowNodes, flowEdges);
  };

  const handleSaveConditions = (conditions: Condition[], operator: 'AND' | 'OR') => {
    if (!selectedEdge) return;

    // Update the edge with condition information
    setEdges(edges => edges.map(edge => {
      if (edge.id === selectedEdge.id) {
        return {
          ...edge,
          label: conditions.length > 0 ? `${conditions.length} condition${conditions.length > 1 ? 's' : ''}` : undefined,
          style: {
            ...edge.style,
            stroke: conditions.length > 0 ? '#F59E0B' : '#6366F1',
            strokeWidth: 2
          },
          data: {
            ...edge.data,
            conditions,
            operator
          }
        };
      }
      return edge;
    }));

    setShowConditionEditor(false);
    setSelectedEdge(null);
    setSelectedSourceQuestion(null);
  };

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: 'var(--gray-50)' }}
      >
        <Background color="#E5E7EB" gap={16} />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'start': return 'var(--primary)';
              case 'question': return '#6366F1';
              case 'logic': return '#F59E0B';
              case 'end': return '#10B981';
              default: return '#9CA3AF';
            }
          }}
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--gray-200)',
          }}
        />
        <Controls />
      </ReactFlow>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '12px',
          padding: '12px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={handleSave}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          💾 Save Logic
        </button>
        
        <div style={{ height: '24px', width: '1px', background: 'var(--gray-200)' }} />
        
        <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
          Drag to connect • Click edges to add conditions
        </span>
      </motion.div>

      <ConditionEditor
        isOpen={showConditionEditor}
        onClose={() => {
          setShowConditionEditor(false);
          setSelectedEdge(null);
          setSelectedSourceQuestion(null);
        }}
        sourceQuestion={selectedSourceQuestion}
        onSave={handleSaveConditions}
        initialConditions={selectedEdge?.data?.conditions || []}
        initialOperator={selectedEdge?.data?.operator || 'AND'}
      />
    </div>
  );
};

export default LogicBuilder;