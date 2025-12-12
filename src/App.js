import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import WorkflowCanvas from './components/WorkflowCanvas';
import NodePalette from './components/NodePalette';
import ErrorBoundary from './components/ErrorBoundary';
import { workflowAPI } from './services/api';

import './App.css';

function App() {
  const [workflow, setWorkflow] = useState(null);
  const [availableNodes, setAvailableNodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  const WORKFLOW_ID = 'twflow_b210db0a85';

  // Load workflow and available nodes on component mount
  useEffect(() => {
    loadWorkflowData();
    loadAvailableNodes();
  }, []);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingDemoData(false);
      console.log(`Attempting to load workflow: ${WORKFLOW_ID} from API...`);
      const workflowData = await workflowAPI.getWorkflow(WORKFLOW_ID);
      setWorkflow(workflowData);
      setIsUsingDemoData(false);
      console.log('✅ Successfully loaded workflow from API:', workflowData);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('❌ Failed to load workflow from API:', err);
      const errorMessage = err.response?.status === 404 
        ? `Workflow '${WORKFLOW_ID}' not found on server`
        : err.message || 'Network error';
      setError(`API Error: ${errorMessage}. Using comprehensive demo data.`);
      setIsUsingDemoData(true);
      
      // Fallback demo data - representing what might be in twflow_b210db0a85
      setWorkflow({
        workflow_id: WORKFLOW_ID,
        nodes: [
          {
            id: 'trigger_webhook_001',
            type: 'trigger',
            name: 'Webhook Trigger',
            description: 'Receives incoming webhook requests',
            position: { x: 50, y: 100 },
            params: { 
              endpoint: '/webhook/incoming',
              method: 'POST',
              auth_required: true 
            }
          },
          {
            id: 'trigger_timer_001',
            type: 'trigger',
            name: 'Scheduled Timer',
            description: 'Runs every 5 minutes',
            position: { x: 50, y: 250 },
            params: { 
              schedule: '*/5 * * * *',
              timezone: 'UTC' 
            }
          },
          {
            id: 'controller_condition_001',
            type: 'controller',
            name: 'Data Validator',
            description: 'Validates incoming data format',
            position: { x: 300, y: 100 },
            params: { 
              validation_rules: ['required_fields', 'data_types'],
              on_fail: 'reject'
            }
          },
          {
            id: 'controller_router_001',
            type: 'controller',
            name: 'Priority Router',
            description: 'Routes based on priority level',
            position: { x: 300, y: 250 },
            params: { 
              conditions: {
                high: 'priority >= 8',
                medium: 'priority >= 5',
                low: 'priority < 5'
              }
            }
          },
          {
            id: 'activity_transform_001',
            type: 'activity',
            name: 'Data Transformer',
            description: 'Transforms data to required format',
            position: { x: 550, y: 50 },
            params: { 
              transformation: 'json_to_xml',
              schema: 'v2.1'
            }
          },
          {
            id: 'activity_notification_001',
            type: 'activity',
            name: 'Send Notification',
            description: 'Sends alert to Slack channel',
            position: { x: 550, y: 150 },
            params: { 
              channel: '#alerts',
              webhook_url: 'https://hooks.slack.com/services/...',
              template: 'priority_alert'
            }
          },
          {
            id: 'activity_database_001',
            type: 'activity',
            name: 'Store in Database',
            description: 'Saves processed data to database',
            position: { x: 550, y: 250 },
            params: { 
              table: 'processed_data',
              connection: 'primary_db',
              batch_size: 100
            }
          },
          {
            id: 'activity_api_call_001',
            type: 'activity',
            name: 'External API Call',
            description: 'Calls third-party service',
            position: { x: 550, y: 350 },
            params: { 
              endpoint: 'https://api.external-service.com/process',
              method: 'POST',
              timeout: 30
            }
          },
          {
            id: 'activity_email_001',
            type: 'activity',
            name: 'Send Email Report',
            description: 'Sends daily summary email',
            position: { x: 800, y: 200 },
            params: { 
              to: ['admin@company.com', 'team@company.com'],
              template: 'daily_summary',
              schedule: 'daily'
            }
          }
        ],
        edges: [
          // Webhook flow
          { id: 'e1', source: 'trigger_webhook_001', target: 'controller_condition_001' },
          { id: 'e2', source: 'controller_condition_001', target: 'activity_transform_001' },
          { id: 'e3', source: 'controller_condition_001', target: 'activity_notification_001' },
          
          // Timer flow
          { id: 'e4', source: 'trigger_timer_001', target: 'controller_router_001' },
          { id: 'e5', source: 'controller_router_001', target: 'activity_database_001' },
          { id: 'e6', source: 'controller_router_001', target: 'activity_api_call_001' },
          
          // Cross connections
          { id: 'e7', source: 'activity_transform_001', target: 'activity_database_001' },
          { id: 'e8', source: 'activity_notification_001', target: 'activity_email_001' },
          { id: 'e9', source: 'activity_database_001', target: 'activity_email_001' }
        ]
      });
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
      setTimeout(() => document.body.removeChild(successDiv), 3000);
      
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
      setTimeout(() => document.body.removeChild(errorDiv), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    loadWorkflowData();
    loadAvailableNodes();
  };

  // Test function to simulate the API response you provided
  const loadTestAPIData = () => {
    const testAPIResponse = {
      "workflowId": "twflow_b210db0a85",
      "definition": {
        "nodes": {
          "categorizeEmailNode": {
            "nodeName": "Determine category for email node",
            "nodeId": "categorize-email-node",
            "nodeParams": {"params": {}},
            "nodeInputs": {},
            "nodeType": "Activity",
            "activityName": "categorize_email_activity",
            "startToCloseTimeoutInMinutes": 1.0
          },
          "emailCreateTriggerNode": {
            "nodeName": "Create Email Trigger Node",
            "nodeId": "email-create-trigger-node",
            "nodeParams": {"params": {}},
            "nodeInputs": {},
            "nodeType": "Trigger",
            "activityName": "create_or_update_mail_trigger",
            "startToCloseTimeoutInMinutes": 1.0
          },
          "paymentAdviceParsingNode": {
            "nodeName": "Parse contents of payment advice",
            "nodeId": "payment-advice-parsing-node",
            "nodeParams": {"params": {"emailId": "$edge3.email_id"}},
            "nodeInputs": {},
            "nodeType": "Activity",
            "activityName": "payment_advice_parsing_activity",
            "startToCloseTimeoutInMinutes": 10.0
          },
          "isPaymentAdviceSharedController": {
            "nodeName": "Check if payment advice is shared",
            "nodeId": "is-payment-advice-shared-controller",
            "nodeParams": {
              "params": {
                "condition": {
                  "dataclassDict": "{\"_type\": \"STATEMENT_TYPE\", \"lhs\": {\"left_statement\": null, \"right_statement\": null, \"operator\": null, \"value_placeholder\": \"$edge2.categorization.categories[0]\", \"value\": null}, \"rhs\": {\"left_statement\": null, \"right_statement\": null, \"operator\": null, \"value_placeholder\": null, \"value\": \"PAYMENT_ADVICE_SHARED\"}, \"operator\": \"CONTAINS\"}"
                },
                "inputEdgeName": "edge2",
                "trueEdgeOutput": "edge3"
              }
            },
            "nodeInputs": {},
            "nodeType": "Controller",
            "activityName": "if_else_activity",
            "startToCloseTimeoutInMinutes": 1.0
          }
        },
        "edges": [
          {"fromNodeId": "email-create-trigger-node", "toNodeId": "categorize-email-node", "edgeName": "edge1"},
          {"fromNodeId": "categorize-email-node", "toNodeId": "is-payment-advice-shared-controller", "edgeName": "edge2"},
          {"fromNodeId": "is-payment-advice-shared-controller", "toNodeId": "payment-advice-parsing-node", "edgeName": "edge3"}
        ]
      }
    };
    
    setWorkflow(testAPIResponse);
    setIsUsingDemoData(false);
    setError(null);
    setLoading(false);
    console.log('✅ Loaded test API data:', testAPIResponse);
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

  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
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
              
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => console.log('Current workflow state:', workflow)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
                  title="Debug: Log current workflow state"
                >
                  <span>Debug</span>
                </button>
              )}
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
    </DndProvider>
  </ErrorBoundary>
  );
}

export default App;
