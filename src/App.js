import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import ErrorBoundary from './components/ErrorBoundary';
import { workflowAPI } from './services/api';
import { testWorkflowResponse } from './data/testWorkflowData';
import { API_CONFIG, UI_CONFIG } from './constants/config';

import './App.css';

function App() {
  const [workflow, setWorkflow] = useState(null);
  const [availableNodes, setAvailableNodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  const WORKFLOW_ID = API_CONFIG.WORKFLOW_ID;

  // Load test API data from external file
  const loadTestAPIData = () => {
    console.log('Loading test API data structure from external file');
    setWorkflow(testWorkflowResponse);
    setIsUsingDemoData(true); // This is still demo data, just in API format
    setLoading(false);
    console.log('Test API workflow loaded successfully - 4 nodes, 3 edges');
  };

  // Load workflow and available nodes on component mount
  useEffect(() => {
    // First try to load from API, if it fails, automatically load test data
    console.log('Component mounted, attempting to load workflow from API...');
    const initializeWorkflow = async () => {
      try {
        await loadWorkflowData();
      } catch (error) {
        console.log('API failed, loading test data as fallback');
        loadTestAPIData();
      }
    };
    
    initializeWorkflow();
    loadAvailableNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We want this to run only once on mount

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingDemoData(false);
      console.log(`Attempting to load workflow: ${WORKFLOW_ID} from API...`);
      const workflowData = await workflowAPI.getWorkflow(WORKFLOW_ID);
      setWorkflow(workflowData);
      setIsUsingDemoData(false);
      console.log('Successfully loaded workflow from API:', workflowData);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Failed to load workflow from API:', err);
      const errorMessage = err.response?.status === 404 
        ? `Workflow '${WORKFLOW_ID}' not found on server`
        : err.message || 'Network error';
      setError(`API Error: ${errorMessage}. Showing workflow structure in demo mode.`);
      setIsUsingDemoData(true);
      
      // Automatically load the test API data structure as fallback
      console.log('Loading test API data as fallback...');
      loadTestAPIData();
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableNodes = async () => {
    try {
      const nodesData = await workflowAPI.getNodes();
      console.log('API returned nodes data:', nodesData);
      setAvailableNodes(nodesData);
    } catch (err) {
      console.error('Failed to load available nodes:', err);
      // Will use default nodes from NodePalette component
      setAvailableNodes(null);
    }
  };

  const handleSaveWorkflow = async (workflowData) => {
    try {
      setSaving(true);
      setError(null);
      
      // Convert our internal format to API format if we're using real API data
      let updateData;
      
      if (!isUsingDemoData && workflow?.definition) {
        // Convert to API format
        const apiNodes = {};
        workflowData.nodes.forEach(node => {
          // Generate a key for the node (remove hyphens and make camelCase)
          const nodeKey = node.id.replace(/-/g, '').replace(/([A-Z])/g, (match, letter, index) => 
            index === 0 ? letter.toLowerCase() : letter
          ) + 'Node';
          
          apiNodes[nodeKey] = {
            nodeName: node.name,
            nodeId: node.id,
            nodeParams: { params: node.params || {} },
            nodeInputs: {},
            nodeType: node.type === 'trigger' ? 'Trigger' : 
                     node.type === 'controller' ? 'Controller' : 'Activity',
            activityName: node.data?.activityName || `${node.type}_activity`,
            startToCloseTimeoutInMinutes: 1.0
          };
        });
        
        const apiEdges = workflowData.edges.map(edge => ({
          fromNodeId: edge.source,
          toNodeId: edge.target,
          edgeName: edge.id
        }));
        
        updateData = {
          workflowId: WORKFLOW_ID,
          definition: {
            nodes: apiNodes,
            edges: apiEdges
          }
        };
      } else {
        // Use our internal format for demo mode
        updateData = {
          workflow_id: WORKFLOW_ID,
          ...workflowData
        };
      }
      
      console.log('Saving workflow data:', updateData);
      
      if (!isUsingDemoData) {
        await workflowAPI.updateWorkflow(WORKFLOW_ID, updateData);
        // Update local state with the new data
        setWorkflow(prev => ({ 
          ...prev, 
          definition: updateData.definition 
        }));
      }
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successDiv.textContent = isUsingDemoData ? 
        'Changes saved locally (demo mode)' : 
        'Workflow saved to server successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), UI_CONFIG.NOTIFICATION_DURATION);
      
    } catch (err) {
      console.error('Failed to save workflow:', err);
      const errorMessage = err.response?.status === 400 ? 
        'Invalid workflow format' : 
        err.response?.status === 404 ? 
        'Workflow not found on server' :
        'Network error or server unavailable';
      setError(`Failed to save workflow: ${errorMessage}. Please try again.`);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorDiv.textContent = `Save failed: ${errorMessage}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), UI_CONFIG.ERROR_NOTIFICATION_DURATION);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    loadWorkflowData();
    loadAvailableNodes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering App with workflow:', workflow);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Canvas</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  Workflow ID: {WORKFLOW_ID}
                </p>
                {isUsingDemoData ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Data
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Live API
                  </span>
                )}
              </div>
              {isUsingDemoData ? (
                <p className="text-xs text-gray-500 mt-1">
                  Showing representative workflow structure for {WORKFLOW_ID}
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1">
                  Connected to API - showing real workflow data
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {error && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                  {isUsingDemoData && (
                    <button
                      onClick={loadWorkflowData}
                      className="ml-2 text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
                      title="Try to connect to API again"
                    >
                      Retry API
                    </button>
                  )}
                </div>
              )}
              
              {saving && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isUsingDemoData ? 'Saving locally...' : 'Saving to server...'}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Refresh workflow"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={loadTestAPIData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                title="Load test API response"
              >
                <span>Test API Data</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          <NodePalette availableNodes={availableNodes} />
          <WorkflowCanvas 
            workflow={workflow}
            onSave={handleSaveWorkflow}
            onLoad={loadWorkflowData}
          />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Drag nodes from the palette to the canvas. Click on node text to edit. Connect nodes by dragging from output to input handles.
              {isUsingDemoData && (
                <span className="block text-xs text-blue-600 mt-1">
                  Running in demo mode - all functionality works, but changes won't be saved to server.
                </span>
              )}
            </div>
            <div>
              Trigger nodes cannot have incoming connections. Press Enter to save, Escape to cancel.
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
