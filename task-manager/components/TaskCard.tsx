import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  assignee?: string;
  dueDate?: Date;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleSaveTitle = () => {
    onUpdate(task.id, { title });
    setIsEditing(false);
  };

  const priorityColors = {
    P1: 'bg-red-500',
    P2: 'bg-orange-400',
    P3: 'bg-blue-400',
    P4: 'bg-gray-400',
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 shadow-lg mb-3 border border-gray-200 border-opacity-20">
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleComplete}
          className="mr-2 h-5 w-5"
        />
        
        {isEditing ? (
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white bg-opacity-20 rounded px-2 py-1"
              autoFocus
            />
            <button 
              onClick={handleSaveTitle}
              className="text-sm bg-primary bg-opacity-90 text-black px-2 py-1 rounded mt-1"
            >
              Save
            </button>
          </div>
        ) : (
          <div
            className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {task.title}
          </div>
        )}
        
        <div
          className={`${
            priorityColors[task.priority]
          } rounded-full h-5 w-5 ml-2`}
          title={`Priority: ${task.priority}`}
        />
      </div>
      
      <div className="flex text-sm text-gray-300 justify-between">
        <div>{task.assignee ? `Assigned to: ${task.assignee}` : 'Unassigned'}</div>
        <div>{formatDate(task.dueDate)}</div>
      </div>
    </div>
  );
} 