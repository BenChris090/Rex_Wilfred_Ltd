import React from 'react';
import TaskList from '../components/TaskList';

const TasksPage: React.FC = () => {

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your tasks
        </p>
      </div>

      <TaskList />
    </div>
  );
};

export default TasksPage; 