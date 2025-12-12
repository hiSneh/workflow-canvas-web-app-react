import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
} from 'reactflow';
import { Save, Download, Trash2 } from 'lucide-react';

import TriggerNode from './nodes/TriggerNode';
import ControllerNode from './nodes/ControllerNode';
import ActivityNode from './nodes/ActivityNode';

import 'reactflow/dist/style.css';

const nodeTypes = {
  trigger: TriggerNode,
  controller: ControllerNode,
  activity: ActivityNode,
};

const WorkflowCanvas = ({ workflow, onSave, onLoad }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle node data updates
  const handleNodeUpdate = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      )
    );
  }, [setNodes]);

  // Load workflow data when it changes
  useEffect(() => {
    if (workflow) {
      let workflowNodes = [];
      let workflowEdges = [];

      // Check if it's the new API format with definition.nodes
      if (workflow.definition && workflow.definition.nodes) {
        console.log('Processing API workflow format:', workflow);
        
        // Convert API nodes format to our format
        const apiNodes = workflow.definition.nodes;
        workflowNodes = Object.entries(apiNodes).map(([nodeKey, nodeData], index) => {
          // Determine node type based on nodeType field
          let nodeType = 'activity'; // default
          if (nodeData.nodeType === 'Trigger') nodeType = 'trigger';
          else if (nodeData.nodeType === 'Controller') nodeType = 'controller';
          else if (nodeData.nodeType === 'Activity') nodeType = 'activity';

          // Calculate position based on node type and workflow structure
          let position = { x: 100, y: 100 };
          
          // Position nodes in a logical flow
          if (nodeType === 'trigger') {
            position = { x: 50, y: 100 + index * 150 };
          } else if (nodeType === 'controller') {
            position = { x: 350, y: 150 + index * 100 };
          } else if (nodeType === 'activity') {
            position = { x: 650, y: 100 + index * 120 };
          }
          
          return {
            id: nodeData.nodeId,
            type: nodeType,
            position,
            data: {
              name: nodeData.nodeName,
              description: `${nodeData.activityName} (${nodeData.nodeType})`,
              params: nodeData.nodeParams || {},
              onUpdate: handleNodeUpdate,
            },
          };
        });

        // Convert API edges format to our format
        if (workflow.definition.edges) {
          workflowEdges = workflow.definition.edges.map((edge, index) => ({
            id: edge.edgeName || `edge-${index}`,
            source: edge.fromNodeId,
            target: edge.toNodeId,
            type: 'smoothstep',
            animated: true,
            label: edge.edgeName,
            labelStyle: { 
              fontSize: 10, 
              fontWeight: 500,
              fill: '#6b7280',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '4px'
            },
            labelBgStyle: { 
              fill: 'white', 
              fillOpacity: 0.8,
              rx: 4,
              ry: 4
            },
          }));
        }
      }
      // Fallback to demo format (our existing structure)
      else if (workflow.nodes) {
        console.log('Processing demo workflow format:', workflow);
        
        workflowNodes = workflow.nodes.map((node, index) => ({
          id: node.id || `node-${index}`,
          type: node.type || 'activity',
          position: node.position || { x: 100 + index * 200, y: 100 },
          data: {
            name: node.name,
            description: node.description || '',
            params: node.params || {},
            onUpdate: handleNodeUpdate,
          },
        }));

        workflowEdges = workflow.edges?.map((edge, index) => ({
          id: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: true,
        })) || [];
      }

      console.log('Setting nodes:', workflowNodes);
      console.log('Setting edges:', workflowEdges);
      
      setNodes(workflowNodes);
      setEdges(workflowEdges);
    }
  }, [workflow, setNodes, setEdges, handleNodeUpdate]);

  // Validate connection - trigger nodes should not have incoming edges
  const isValidConnection = useCallback((connection) => {
    const targetNode = nodes.find(node => node.id === connection.target);
    if (targetNode && targetNode.type === 'trigger') {
      return false; // Trigger nodes cannot have incoming connections
    }
    return true;
  }, [nodes]);

  const onConnect = useCallback(
    (params) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
      }
    },
    [setEdges, isValidConnection]
  );


  // Handle drag over for ReactFlow
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle drop for ReactFlow
  const onDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    
    // Check if the dropped element is a valid node type
    if (typeof type === 'undefined' || !type) {
      return;
    }

    const nodeData = JSON.parse(type);
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `${nodeData.nodeType}-${Date.now()}`,
      type: nodeData.nodeType,
      position,
      data: {
        name: nodeData.label,
        description: nodeData.description,
        params: {},
        onUpdate: handleNodeUpdate,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, handleNodeUpdate]);

  const onSelectionChange = useCallback((params) => {
    setSelectedNodes(params.nodes || []);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodeIds = selectedNodes.map(node => node.id);
    setNodes((nds) => nds.filter(node => !selectedNodeIds.includes(node.id)));
    setEdges((eds) => eds.filter(edge => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));
    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    const workflowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        name: node.data.name,
        description: node.data.description,
        params: node.data.params,
        position: node.position,
        data: node.data, // Preserve all data for API conversion
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })),
    };
    
    console.log('Preparing to save workflow data:', workflowData);
    
    if (onSave) {
      onSave(workflowData);
    }
  }, [nodes, edges, onSave]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        name: node.data.name,
        description: node.data.description,
        params: node.data.params,
        position: node.position,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'workflow.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  return (
    <div className="flex-1 relative">
      <div 
        className={`w-full h-full transition-all duration-200 ${
          isDragOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : ''
        }`} 
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onSelectionChange={onSelectionChange}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.type === 'trigger') return '#10b981';
              if (n.type === 'controller') return '#f59e0b';
              return '#3b82f6';
            }}
            nodeColor={(n) => {
              if (n.type === 'trigger') return '#dcfce7';
              if (n.type === 'controller') return '#fef3c7';
              return '#dbeafe';
            }}
          />
          <Controls />
          <Background color="#aaa" gap={16} />
          
          <Panel position="top-left">
            <div className="flex space-x-2 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Save Workflow"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              
              <button
                onClick={exportWorkflow}
                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Export Workflow"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              {selectedNodes.length > 0 && (
                <button
                  onClick={deleteSelectedNodes}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete ({selectedNodes.length})</span>
                </button>
              )}
            </div>
          </Panel>

          <Panel position="bottom-right">
            <div className="bg-white rounded-lg shadow-lg p-3 text-sm text-gray-600">
              <div>Nodes: {nodes.length}</div>
              <div>Edges: {edges.length}</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
