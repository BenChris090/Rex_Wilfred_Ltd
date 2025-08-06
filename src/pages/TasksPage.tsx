import React from 'react';
import TaskList from '../components/TaskList';
import type { Task } from '../types';

const TasksPage: React.FC = () => {
  const handleTaskClick = (task: Task) => {
    // Navigate to task details or open modal
    console.log('Task clicked:', task);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your tasks
        </p>
      </div>

      <TaskList onTaskClick={handleTaskClick} />
    </div>
  );
};

export default TasksPage; 