# Workflow Canvas

A modern, interactive workflow editor built with React and React Flow. This application allows users to create, edit, and manage visual workflows with drag-and-drop functionality.

## Features

### ✨ Core Functionality
- **Visual Workflow Editor**: Interactive canvas for creating and editing workflows
- **Drag & Drop Interface**: Intuitive node placement from palette to canvas
- **Three Node Types**:
  - 🟢 **Trigger Nodes**: Starting points for workflows (email, timer, webhook triggers)
  - 🟡 **Controller Nodes**: Conditional routing and logic (if/else, switches, loops)
  - 🔵 **Activity Nodes**: Task execution (email, Slack, AI agents, API calls)
- **Smart Connections**: Visual edge connections with validation rules
- **Real-time Updates**: Live workflow modification and saving

### 🎯 Workflow Management
- **Load Existing Workflows**: Fetch and display workflows by ID
- **Save & Export**: Save changes to server or export as JSON
- **Validation Rules**: Trigger nodes cannot have incoming connections
- **Multi-selection**: Select and delete multiple nodes at once

### 🎨 User Experience
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Responsive Design**: Works on different screen sizes
- **Visual Feedback**: Animated connections, hover states, loading indicators
- **Minimap & Controls**: Navigation aids for large workflows
- **Error Handling**: Graceful fallbacks and user feedback

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Flow**: Powerful node-based UI library
- **Tailwind CSS**: Utility-first CSS framework
- **React DnD**: Drag and drop functionality
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful, customizable icons

## API Integration

The application integrates with the Rubik API:
- **Base URL**: `https://rubik.valyx.com/`
- **Get Workflow**: `GET /workflows/{workflow_id}`
- **Get Available Nodes**: `GET /nodes`
- **Update Workflow**: `PUT /workflow/update/{workflow_id}`

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage Guide

### 1. Loading a Workflow
- The app automatically loads the workflow with ID `dibakarjayjot@gmail.com`
- If the API is unavailable, demo data is used as fallback

### 2. Adding Nodes
- **Drag** nodes from the left palette
- **Drop** them onto the canvas
- Nodes are automatically positioned where you drop them

### 3. Connecting Nodes
- **Drag** from an output handle (right side of node)
- **Drop** on an input handle (left side of target node)
- Connections are animated and validated in real-time

### 4. Editing Workflows
- **Select** nodes by clicking
- **Move** nodes by dragging
- **Delete** selected nodes using the delete button
- **Save** changes using the save button

### 5. Validation Rules
- ✅ Trigger nodes can only have outgoing connections
- ✅ Controller and Activity nodes can have both incoming and outgoing connections
- ❌ Trigger nodes cannot receive incoming connections

## Project Structure

```
src/
├── components/
│   ├── nodes/
│   │   ├── TriggerNode.js      # Green trigger node component
│   │   ├── ControllerNode.js   # Yellow controller node component
│   │   └── ActivityNode.js     # Blue activity node component
│   ├── WorkflowCanvas.js       # Main canvas with React Flow
│   └── NodePalette.js          # Draggable node palette sidebar
├── services/
│   └── api.js                  # API service layer
├── App.js                      # Main application component
├── App.css                     # Application styles
├── index.js                    # React entry point
└── index.css                   # Global styles
```

## Key Components

### WorkflowCanvas
- Main canvas using React Flow
- Handles node/edge state management
- Implements drag & drop from palette
- Validates connections
- Provides save/export functionality

### NodePalette
- Sidebar with available node types
- Implements drag source for nodes
- Categorizes nodes by type
- Shows node descriptions

### Node Components
- **TriggerNode**: Green styling, output handle only
- **ControllerNode**: Yellow styling, input/output handles
- **ActivityNode**: Blue styling, input/output handles

### API Service
- Centralized API communication
- Error handling and fallbacks
- Workflow CRUD operations

## Customization

### Adding New Node Types
1. Create new node component in `src/components/nodes/`
2. Add to `nodeTypes` object in `WorkflowCanvas.js`
3. Update `NodePalette.js` to include new type
4. Add styling in CSS files

### Styling Modifications
- Edit `tailwind.config.js` for theme changes
- Modify `src/App.css` for React Flow customizations
- Update node components for visual changes

## Error Handling

The application includes comprehensive error handling:
- **API Failures**: Graceful fallbacks to demo data
- **Network Issues**: User-friendly error messages
- **Validation Errors**: Real-time feedback
- **Loading States**: Visual indicators during operations

## Performance Considerations

- **Lazy Loading**: Components loaded as needed
- **Memoization**: Optimized re-renders with useCallback
- **Efficient Updates**: React Flow's built-in optimizations
- **Minimal Re-renders**: Proper state management

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the console for error messages
2. Verify API connectivity
3. Review network requests in browser dev tools
4. Check React Flow documentation for advanced features
