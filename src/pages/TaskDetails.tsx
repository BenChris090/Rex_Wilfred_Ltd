import React from 'react';
import type { Task, User, TaskSubmission } from '../types';

interface TaskDetailsProps {
  task: Task;
  assignedUser?: User;
  submission?: TaskSubmission;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, assignedUser, submission }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Reward:</span>
          <span className="ml-1 font-medium text-green-600">₦{task.reward.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Due Date:</span>
          <span className="ml-1 font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>
          <span className="ml-1 font-medium capitalize">{task.status}</span>
        </div>
      </div>
      <div className="mb-4">
        <span className="text-gray-500">Assigned To:</span>
        <span className="ml-1 font-medium">{assignedUser ? assignedUser.name : task.assignedTo}</span>
      </div>
      {submission && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Submission</h3>
          <div className="mb-2 text-gray-700">{submission.proofText}</div>
          {submission.proofFiles && submission.proofFiles.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Files:</h4>
              <ul className="list-disc pl-5">
                {submission.proofFiles.map((file, idx) => (
                  <li key={idx} className="text-blue-600 underline cursor-pointer">{file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetails; 