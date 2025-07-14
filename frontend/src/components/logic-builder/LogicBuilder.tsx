import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  MiniMap,
  Panel,
  type Connection,
  type Edge,
  type Node,
  type NodeDragHandler,
} from 'reactflow';
import { motion } from 'framer-motion';

import { QuestionNode, LogicNode, EndNode, StartNode } from './nodes';
import { ConditionalEdge } from './edges';
import ConditionEditor from './ConditionEditor';
import type { Survey, Question, FlowNode, FlowEdge, Condition } from '../../types';

const nodeTypes = {
  question: QuestionNode,
  logic: LogicNode,
  end: EndNode,
  start: StartNode,
};

const edgeTypes = {
  conditional: ConditionalEdge,
};

interface LogicBuilderProps {
  survey: Survey;
  onSave: (nodes: FlowNode[], edges: FlowEdge[]) => void;
}

// Inner component that uses ReactFlow hooks
const LogicBuilderInner = ({ survey, onSave }: LogicBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showConditionEditor, setShowConditionEditor] = useState(false);
  const [selectedSourceQuestion, setSelectedSourceQuestion] = useState<Question | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testPath, setTestPath] = useState<string[]>([]);

  // Debug logging
  console.log('LogicBuilder rendering, nodes count:', nodes.length, 'edges count:', edges.length);

  // Initialize nodes from survey questions
  useEffect(() => {
    console.log('LogicBuilder useEffect - survey:', survey);
    console.log('LogicBuilder useEffect - questions:', survey.questions);
    
    if (survey.flowData?.nodes && survey.flowData?.edges) {
      // Load existing flow data
      console.log('Loading existing flow data');
      setNodes(survey.flowData.nodes);
      setEdges(survey.flowData.edges);
    } else {
      // Create initial flow from questions
      console.log('Creating initial flow from questions');
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
            type: 'conditional',
            animated: true,
            data: { conditions: [], operator: 'AND' }
          });
        }

        // Check for existing conditional logic
        if (question.conditionalLogic && question.conditionalLogic.length > 0) {
          // Convert conditional logic to edges
          question.conditionalLogic.forEach((logic) => {
            const targetId = logic.nextQuestionId || 'end';
            const edgeId = `${question.id}-${targetId}`;
            
            // Check if edge already exists
            const existingEdge = initialEdges.find(e => e.id === edgeId);
            
            if (!existingEdge) {
              const conditions: Condition[] = logic.value !== '*' ? [{
                id: logic.id,
                operator: logic.condition as any,
                value: logic.value
              }] : [];
              
              initialEdges.push({
                id: edgeId,
                source: question.id,
                target: targetId,
                type: 'conditional',
                style: {
                  stroke: conditions.length > 0 ? '#F59E0B' : '#6366F1',
                  strokeWidth: 2
                },
                data: {
                  conditions,
                  operator: 'AND'
                }
              });
            }
          });
        } else if (index < survey.questions.length - 1) {
          // Default sequence if no conditional logic
          initialEdges.push({
            id: `${question.id}-${survey.questions[index + 1].id}`,
            source: question.id,
            target: survey.questions[index + 1].id,
            type: 'conditional',
            data: { conditions: [], operator: 'AND' }
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

      // Connect last question to end, or connect start to end if no questions
      if (survey.questions.length > 0) {
        const lastQuestion = survey.questions[survey.questions.length - 1];
        initialEdges.push({
          id: `${lastQuestion.id}-end`,
          source: lastQuestion.id,
          target: 'end',
          type: 'conditional',
          data: { conditions: [], operator: 'AND' }
        });
      } else {
        // No questions, connect start directly to end
        initialEdges.push({
          id: 'start-end',
          source: 'start',
          target: 'end',
          type: 'conditional',
          animated: true,
          data: { conditions: [], operator: 'AND' }
        });
      }

      console.log('Setting initial nodes:', initialNodes);
      console.log('Setting initial edges:', initialEdges);
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
        type: 'conditional',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366F1',
        },
        style: {
          stroke: '#6366F1',
          strokeWidth: 2,
        },
        data: {
          conditions: [],
          operator: 'AND'
        }
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

  // Save logic to parent
  const handleSaveLogic = useCallback(() => {
    // Convert React Flow nodes and edges to our format
    const flowNodes: FlowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type || 'question',
      position: node.position,
      data: node.data,
    }));

    const flowEdges: FlowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      style: edge.style,
      data: edge.data,
    }));

    onSave(flowNodes, flowEdges);
  }, [nodes, edges, onSave]);

  // Test mode handlers
  const handleTestMode = () => {
    if (isTestMode) {
      // Exit test mode
      setIsTestMode(false);
      setTestPath([]);
      // Reset node colors
      setNodes(nodes => nodes.map(node => ({
        ...node,
        style: undefined
      })));
    } else {
      // Enter test mode
      setIsTestMode(true);
      setTestPath(['start']);
      // Highlight start node
      setNodes(nodes => nodes.map(node => ({
        ...node,
        style: node.id === 'start' ? {
          background: '#10b981',
          color: 'white',
          border: '2px solid #059669'
        } : undefined
      })));
    }
  };

  // Drag handlers
  const onNodeDragStart: NodeDragHandler = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onNodeDragStop: NodeDragHandler = useCallback(() => {
    setIsDragging(false);
    handleSaveLogic();
  }, [handleSaveLogic]);

  console.log('LogicBuilder rendering with nodes:', nodes);
  console.log('LogicBuilder rendering with edges:', edges);

  // Check if we have at least one node
  if (nodes.length === 0) {
    console.warn('No nodes to render in LogicBuilder');
  }

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative', backgroundColor: '#f3f4f6' }}>
      {nodes.length === 0 ? (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Loading flow diagram...
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(event, node) => {
            if (isTestMode && node.type === 'question') {
              // In test mode, clicking a question simulates selecting an answer
              const connectedEdges = edges.filter(e => e.source === node.id);
              if (connectedEdges.length > 0) {
                // For simplicity, follow the first edge
                const nextNodeId = connectedEdges[0].target;
                setTestPath([...testPath, node.id, nextNodeId]);
                
                // Highlight the path
                setNodes(nodes => nodes.map(n => ({
                  ...n,
                  style: [...testPath, node.id, nextNodeId].includes(n.id) ? {
                    background: '#10b981',
                    color: 'white',
                    border: '2px solid #059669'
                  } : undefined
                })));
              }
            }
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          defaultEdgeOptions={{
            type: 'conditional',
            animated: true,
            style: {
              strokeWidth: 2,
              stroke: '#6366f1',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#6366f1',
            },
          }}
          style={{ background: '#f9fafb', width: '100%', height: '100%' }}
        >
          <Background color="#E5E7EB" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'start') return '#10b981';
              if (node.type === 'end') return '#ef4444';
              if (node.selected) return '#6366f1';
              return '#94a3b8';
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #e5e7eb',
            }}
          />
          <Panel position="top-left" style={{ margin: '10px' }}>
            <div style={{
              background: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '13px',
              fontWeight: '500',
              color: '#6b7280',
            }}>
              {isDragging ? '🔄 Repositioning...' : '📍 Drag nodes to reposition'}
            </div>
          </Panel>
        </ReactFlow>
      )}

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
          onClick={handleTestMode}
          style={{
            background: isTestMode ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginRight: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${isTestMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isTestMode ? '🛑 Exit Test' : '🧪 Test Flow'}
        </button>
        
        <button
          onClick={handleSaveLogic}
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
          {isTestMode ? 'Click questions to simulate survey flow' : 'Drag to connect • Click edges to add conditions'}
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

// Main component that provides ReactFlowProvider
const LogicBuilder = (props: LogicBuilderProps) => {
  return (
    <ReactFlowProvider>
      <LogicBuilderInner {...props} />
    </ReactFlowProvider>
  );
};

export default LogicBuilder;