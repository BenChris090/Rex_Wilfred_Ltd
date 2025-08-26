import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path to your Firebase config
import { getTasksByState } from "../services/FetchTasksState";
import { getTasks } from '../services/FetchTasks';
import type { Task } from '../types';
import VerificationPage from '../pages/VerificationPage'; // ← add this!
import ApprovalModal from '../pages/ApprovalPage'; // ← import the modal
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import TaskDetails from '../pages/TaskDetails';

interface TaskListProps {
  showActions?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ showActions = true }) => {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'submitted' | 'approved' | 'rejected' | 'verified'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // ← modal state
  const [viewType, setViewType] = useState<'approval' | 'verification' | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userData) return;

      try {
        if (userData.role === 'team_member') {
          // Only fetch tasks assigned to this team member
          if (typeof userData.state === 'string') {
            const allTasks = await getTasksByState(userData.state);
            const assignedTasks = allTasks.filter(
              (task: Task) => task.assignedTo === userData.id
            );
            setTasks(assignedTasks);
          } else {
            setTasks([]); // or handle the missing state case as needed
  }
        } else if (userData.role === 'state_head') {
          if (userData?.state) {
            const stateTasks = await getTasksByState(userData.state);
            setTasks(stateTasks);
          }
        } else {
          const allTasks = await getTasks();
          setTasks(allTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userData]);

const handleApprove = async () => {
  if (!selectedTask?.id) return;

  const taskRef = doc(db, 'tasks', selectedTask?.id);
  await updateDoc(taskRef, {
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  });
};

const handleReject = async () => {
  if (!selectedTask?.id) return;

  const taskRef = doc(db, 'tasks', selectedTask?.id);
  await updateDoc(taskRef, {
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
  });
};


  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'submitted':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'assigned':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'assigned', 'submitted', 'approved', 'verified'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as Task['status'])}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks found.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Reward:</span>
                        <span className="ml-1 font-medium text-green-600">₦{task.reward.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <span className="ml-1 font-medium">
                          {task.dueDate ? format(task.dueDate, 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-1 font-medium">
                          {task.createdAt ? format(task.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>

                      {showActions && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          {(userData?.role === 'state_head' || userData?.role === 'super_admin') &&
                            task.status === 'submitted' && (
                              <button
                                onClick={() => { setSelectedTask(task); setViewType(userData?.role === 'super_admin' ? 'verification' : 'approval');}}
                                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Review
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {selectedTask && !viewType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] p-6">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <TaskDetails task={selectedTask}/>
          </div>
        </div>
      )}

      {/* Verification Page */}
      {selectedTask && viewType === 'verification' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] p-6">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <VerificationPage/>
          </div>
        </div>
      )}

      {selectedTask && viewType === 'approval' && (
        <ApprovalModal
          task={selectedTask}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => {
            setSelectedTask(null);
            setViewType(null);
          }}
        />
      )}

      
    </div>
  );
};

export default TaskList;
