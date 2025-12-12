# API Integration Information

## Current Status
The application is designed to work with the Rubik API but gracefully falls back to demo data when the API is unavailable.

## API Details
- **Base URL**: `https://rubik.valyx.com/`
- **Workflow ID**: `twflow_b210db0a85`
- **Documentation**: https://gist.github.com/anirudh-valyx/d15192e79fd2456bdba45123f870195e

## Endpoints Used
1. **GET /workflows/{workflow_id}** - Load existing workflow
2. **GET /nodes** - Get available node types
3. **PUT /workflow/update/{workflow_id}** - Save workflow changes

## Demo Mode
When the API is unavailable, the application automatically switches to demo mode:

- ✅ **Full Functionality**: All features work exactly the same
- ✅ **Representative Workflow**: Loads a comprehensive demo workflow for `twflow_b210db0a85`
- ✅ **Complex Structure**: Multiple triggers, controllers, and activities with realistic connections
- ✅ **Local Editing**: You can add, edit, delete, and connect nodes
- ❌ **No Persistence**: Changes are not saved to the server
- 🔄 **Retry Option**: Click "Retry API" to attempt reconnection

## Expected Behavior
This is normal behavior for development and testing. The application is designed to work offline and provide a complete user experience even without API connectivity.

## For Production
In a production environment, ensure:
1. API server is running and accessible
2. CORS is properly configured
3. Network connectivity is stable
4. Workflow ID exists in the database
