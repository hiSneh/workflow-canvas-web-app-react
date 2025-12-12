// Application configuration constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://rubik.valyx.com',
  WORKFLOW_ID: 'twflow_b210db0a85',
  ENDPOINTS: {
    GET_WORKFLOW: '/workflows',
    GET_NODES: '/nodes',
    UPDATE_WORKFLOW: '/workflow/update'
  }
};

// UI Configuration
export const UI_CONFIG = {
  NOTIFICATION_DURATION: 3000, // milliseconds
  ERROR_NOTIFICATION_DURATION: 5000, // milliseconds
  LOADING_DELAY: 100 // milliseconds
};

// Node Types
export const NODE_TYPES = {
  TRIGGER: 'trigger',
  CONTROLLER: 'controller', 
  ACTIVITY: 'activity'
};

// API Node Types (from API response)
export const API_NODE_TYPES = {
  TRIGGER: 'Trigger',
  CONTROLLER: 'Controller',
  ACTIVITY: 'Activity'
};
