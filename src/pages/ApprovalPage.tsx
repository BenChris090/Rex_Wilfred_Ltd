import React from 'react';
import type { Task } from '../types'; // Adjust import path if needed
import {
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ApprovalModalProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}



const ApprovalModal: React.FC<ApprovalModalProps> = ({ task, onApprove, onReject, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Review Task Submission
        </h2>

        <div className="space-y-3 text-gray-700 text-sm sm:text-base">
          <p><span className="font-semibold">Title:</span> {task.title}</p>
          <p><span className="font-semibold">Description:</span> {task.description}</p>
          <p><span className="font-semibold">Assigned To:</span> {task.assignedTo}</p>
          <p><span className="font-semibold">Reward:</span> ₦{task.reward.toLocaleString()}</p>
          <p><span className="font-semibold">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {onReject(); onClose()}}
            className="w-full sm:w-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition"
          >
            Reject
          </button>
          <button
            onClick={() => {onApprove(); onClose()}}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
