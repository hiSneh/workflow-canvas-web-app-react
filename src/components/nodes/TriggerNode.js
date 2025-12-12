import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Edit3, Check, X } from 'lucide-react';

const TriggerNode = ({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(data.name || 'Trigger Node');
  const [editDescription, setEditDescription] = useState(data.description || 'Workflow trigger');

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    // Update the node data
    if (data.onUpdate) {
      data.onUpdate(id, {
        name: editName,
        description: editDescription,
      });
    }
    setIsEditing(false);
  }, [editName, editDescription, data, id]);

  const handleCancelEdit = useCallback(() => {
    setEditName(data.name || 'Trigger Node');
    setEditDescription(data.description || 'Workflow trigger');
    setIsEditing(false);
  }, [data.name, data.description]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-green-50 border-2 min-w-[200px] group ${
      selected ? 'border-green-500' : 'border-green-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-sm font-medium bg-white border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Node name"
                autoFocus
              />
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full text-xs bg-white border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description"
              />
            </div>
          ) : (
            <div className="cursor-pointer" onClick={handleStartEdit}>
              <div className="text-sm font-medium text-gray-900 truncate">
                {data.name || 'Trigger Node'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {data.description || 'Workflow trigger'}
              </div>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="flex space-x-1">
            <button
              onClick={handleSaveEdit}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Save"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* Trigger nodes only have output handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
};

export default TriggerNode;
