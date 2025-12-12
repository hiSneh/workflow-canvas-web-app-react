import React, { useState } from 'react';
import { Play, GitBranch, Zap, Plus } from 'lucide-react';

const DraggableNodeItem = ({ nodeType, icon: Icon, typeLabel, description, color }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event) => {
    const nodeData = { nodeType, label: `New ${typeLabel}`, description };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`p-4 rounded-lg border-2 border-dashed cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:scale-105'
      } ${color} hover:shadow-md mb-3`}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          nodeType === 'trigger' ? 'bg-green-500' :
          nodeType === 'controller' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{typeLabel}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
        <Plus className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

const NodePalette = ({ availableNodes }) => {
  // Note: availableNodes is available for future API integration if needed

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Node Palette</h2>
        <p className="text-sm text-gray-600">Drag and drop nodes onto the canvas</p>
      </div>

      <div className="space-y-4">
        {/* Trigger Node */}
        <DraggableNodeItem
          nodeType="trigger"
          icon={Play}
          typeLabel="Trigger Node"
          description="Starting point of workflow"
          color="bg-green-50 border-green-200 hover:border-green-300"
        />

        {/* Controller Node */}
        <DraggableNodeItem
          nodeType="controller"
          icon={GitBranch}
          typeLabel="Controller Node"
          description="Conditional routing logic"
          color="bg-yellow-50 border-yellow-200 hover:border-yellow-300"
        />

        {/* Activity Node */}
        <DraggableNodeItem
          nodeType="activity"
          icon={Zap}
          typeLabel="Activity Node"
          description="Performs tasks and actions"
          color="bg-blue-50 border-blue-200 hover:border-blue-300"
        />
      </div>
    </div>
  );
};

export default NodePalette;
