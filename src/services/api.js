import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service for workflow operations
export const workflowAPI = {
  // Get workflow by ID
  getWorkflow: async (workflowId) => {
    try {
      const response = await api.get(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      throw error;
    }
  },

  // Get available nodes
  getNodes: async () => {
    try {
      const response = await api.get('/nodes');
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      throw error;
    }
  },

  // Update workflow
  updateWorkflow: async (workflowId, workflowData) => {
    try {
      console.log(`Updating workflow ${workflowId} with data:`, workflowData);
      const response = await api.put(`/workflow/update/${workflowId}`, workflowData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      console.error('Request data:', workflowData);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Create new workflow (if needed)
  createWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/workflows', workflowData);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }
};

export default api;
